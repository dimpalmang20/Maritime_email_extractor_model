#!/usr/bin/env python3
"""
Persistent ML daemon for maritime email extraction.
Loads the DistilBERT model ONCE at startup, then handles all inference requests
via TCP on port 9399 using newline-delimited JSON.

If the local model is unavailable (missing files, missing packages, etc.),
the daemon still starts and serves requests — it simply returns empty ML
predictions. This matches the pre-daemon fallback behaviour exactly.
"""
import sys
import json
import os
import socket
import threading
import traceback

os.environ["TRANSFORMERS_VERBOSITY"] = "error"

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

HOST = "127.0.0.1"
PORT = 9399

# ── Model loading (optional — daemon starts even if model is missing) ─────────
print(json.dumps({"status": "loading"}), flush=True)

_extract_entities = None
_merge_fn = None
_ml_available = False
_ml_error = None

try:
    from distilbert_extract import extract_entities as _extract_entities
    from merge_results import merge as _merge_fn
    _ml_available = True
except Exception as _e:
    _ml_error = str(_e)

print(json.dumps({
    "status": "ready",
    "port": PORT,
    "ml_available": _ml_available,
    **({"ml_error": _ml_error} if _ml_error else {})
}), flush=True)
# ─────────────────────────────────────────────────────────────────────────────


def _build_response(email_text, regex_output):
    if not _ml_available:
        # No model — return regex output unchanged (identical to old predict.py fallback)
        return {
            "DEBUG_INFO": {"message": "ML unavailable, regex-only mode"},
            "CONFIDENCE": 0.30,
            "LLM_REQUIRED": True,
            "PURE_REGEX_OUTPUT": regex_output,
            "PURE_ML_OUTPUT": {},
            "FINAL_COMBINED_HYBRID_OUTPUT": regex_output if isinstance(regex_output, list) else {}
        }

    ml_predictions = _extract_entities(email_text)
    merged_final = _merge_fn(regex_output, ml_predictions)

    entity_count = len(ml_predictions)
    if entity_count >= 10:
        confidence = 0.90
    elif entity_count >= 7:
        confidence = 0.75
    elif entity_count >= 5:
        confidence = 0.60
    else:
        confidence = 0.30

    return {
        "DEBUG_INFO": {
            "message": "Pipeline completed successfully",
            "total_ml_entities_found": entity_count
        },
        "CONFIDENCE": confidence,
        "LLM_REQUIRED": confidence < 0.50,
        "PURE_REGEX_OUTPUT": regex_output,
        "PURE_ML_OUTPUT": ml_predictions,
        "FINAL_COMBINED_HYBRID_OUTPUT": merged_final
    }


def handle_client(conn):
    try:
        buf = b""
        while True:
            data = conn.recv(65536)
            if not data:
                break
            buf += data
            while b"\n" in buf:
                line, buf = buf.split(b"\n", 1)
                line = line.strip()
                if not line:
                    continue
                try:
                    request = json.loads(line)
                    email_text = request.get("text", "")
                    regex_output = request.get("regex_output", {})
                    response = _build_response(email_text, regex_output)
                    conn.sendall((json.dumps(response) + "\n").encode("utf8"))
                except Exception as e:
                    tb = traceback.format_exc()
                    err_resp = {
                        "DEBUG_INFO": {"status": "ERROR", "error_msg": str(e), "traceback": tb},
                        "PURE_REGEX_OUTPUT": {},
                        "PURE_ML_OUTPUT": {},
                        "FINAL_COMBINED_HYBRID_OUTPUT": {}
                    }
                    conn.sendall((json.dumps(err_resp) + "\n").encode("utf8"))
    except Exception:
        pass
    finally:
        try:
            conn.close()
        except Exception:
            pass


def main():
    server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        server_sock.bind((HOST, PORT))
    except OSError as e:
        print(json.dumps({"status": "error", "error": str(e)}), flush=True)
        sys.exit(1)

    server_sock.listen(16)

    while True:
        try:
            conn, _ = server_sock.accept()
            t = threading.Thread(target=handle_client, args=(conn,), daemon=True)
            t.start()
        except Exception:
            break


if __name__ == "__main__":
    main()
