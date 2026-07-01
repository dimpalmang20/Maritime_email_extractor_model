#!/usr/bin/env python3
"""
Thin TCP client for the persistent ML daemon.
Replaces predict.py — identical output format, but talks to the daemon
instead of loading DistilBERT itself.

The daemon (daemon.py) is started by server.js at boot. If the daemon is not
reachable after a short wait, the client returns an empty-ML fallback response
(identical to the original predict.py behaviour when the model was missing).
"""
import sys
import json
import os
import socket
import time

HOST = "127.0.0.1"
PORT = 9399
CONNECT_TIMEOUT = 5
READ_TIMEOUT = 120
# Keep retries short — the daemon starts fast once the model is loaded.
# 3 retries × 0.3 s = ~0.9 s max wait before falling back to empty results.
MAX_RETRIES = 3
RETRY_DELAY = 0.3


def connect_to_daemon():
    for attempt in range(MAX_RETRIES):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(CONNECT_TIMEOUT)
            sock.connect((HOST, PORT))
            return sock
        except (ConnectionRefusedError, OSError):
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAY)
    return None  # caller handles None — fast fallback, no exception


def main():
    email_text = sys.stdin.read()

    regex_output = {}
    regex_path = "regex_output.json"
    if os.path.exists(regex_path):
        try:
            with open(regex_path, "r", encoding="utf8") as f:
                regex_output = json.load(f)
        except Exception:
            regex_output = {}

    sock = connect_to_daemon()

    if sock is None:
        # Daemon not reachable — return same empty-ML fallback as old predict.py
        fallback = {
            "DEBUG_INFO": {"status": "DAEMON_UNAVAILABLE"},
            "PURE_REGEX_OUTPUT": regex_output,
            "PURE_ML_OUTPUT": {},
            "FINAL_COMBINED_HYBRID_OUTPUT": regex_output if isinstance(regex_output, list) else {}
        }
        print(json.dumps(fallback))
        return

    try:
        request_payload = json.dumps({"text": email_text, "regex_output": regex_output}) + "\n"
        sock.sendall(request_payload.encode("utf8"))

        sock.settimeout(READ_TIMEOUT)
        response_data = b""
        while True:
            chunk = sock.recv(65536)
            if not chunk:
                break
            response_data += chunk
            if b"\n" in response_data:
                break

        sock.close()
        print(response_data.decode("utf8").strip())

    except Exception as e:
        try:
            import traceback
            tb_text = traceback.format_exc()
        except Exception:
            tb_text = ""
        error_response = {
            "DEBUG_INFO": {"status": "ERROR", "error_msg": str(e), "traceback": tb_text},
            "PURE_REGEX_OUTPUT": regex_output,
            "PURE_ML_OUTPUT": {},
            "FINAL_COMBINED_HYBRID_OUTPUT": regex_output if isinstance(regex_output, list) else {}
        }
        print(json.dumps(error_response))


if __name__ == "__main__":
    main()
