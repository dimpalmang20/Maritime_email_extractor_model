import json
import os
import glob

# Configuration
GOLD_LABELS_DIR = os.path.join("datasets", "gold_labels")
OUTPUT_FILE = os.path.join("datasets", "ner_train.jsonl")

# Universal mapping to normalize variations across different file structures
UNIVERSAL_MAP = {
    "cargo": "CARGO", "cargo_type": "CARGO",
    "quantity": "QUANTITY", "quantity_unit": "QUANTITY",
    "load_port": "LOAD_PORT", "open_port": "LOAD_PORT",
    "discharge_port": "DISCHARGE_PORT",
    "laycan": "LAYCAN", "laycan_start": "LAYCAN", "laycan_end": "LAYCAN",
    "broker": "BROKER",
    "vessel_name": "VESSEL", "vessel": "VESSEL",
    "vessel_type": "VESSEL_TYPE",
    "commission": "FREIGHT_RATE", "freight_rate": "FREIGHT_RATE",
    "matching_region": "PORT", "restrictions": "RESTRICTIONS",
    "dwt": "DWT", "contact": "CONTACT", "status": "CHARTER_TYPE"
}

def clean_value(val):
    """
    Stricter version to prevent sub-word fragments and noise.
    """
    elements = []
    if isinstance(val, list):
        for item in val:
            elements.extend(clean_value(item))
    elif isinstance(val, dict):
        for k, v in val.items():
            elements.extend(clean_value(v))
    elif val is not None:
        s = str(val).strip()
        # Remove empty, null, or common BERT subword fragments
        if s and s.lower() not in ["null", "none", "true", "false", "[]", "{}"]:
            # STRICT FILTER: Remove noise tokens (##) and tiny fragments
            if "##" not in s and len(s) > 1:
                elements.append(s)
    return elements

def compile_data():
    if not os.path.exists(GOLD_LABELS_DIR):
        print(f"Directory {GOLD_LABELS_DIR} not found.")
        return

    json_files = glob.glob(os.path.join(GOLD_LABELS_DIR, "email_*.json"))
    print(f"Found {len(json_files)} JSON files to compile.")
    
    compiled_count = 0
    with open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
        for file_path in sorted(json_files):
            filename = os.path.basename(file_path)
            with open(file_path, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                except Exception as e:
                    print(f"Skipping corrupt file {filename}: {e}")
                    continue
                
                text = ""
                computed_offsets = []

                # --- SCHEMA PROCESSING ---
                # Check for explicit structure (text + entities dict)
                if isinstance(data, dict) and "text" in data and "entities" in data:
                    text = data["text"]
                    raw_entities = data["entities"]
                    
                    if isinstance(raw_entities, dict):
                        for label, values in raw_entities.items():
                            for val in clean_value(values):
                                start_idx = text.find(val)
                                while start_idx != -1:
                                    computed_offsets.append([start_idx, start_idx + len(val), label])
                                    start_idx = text.find(val, start_idx + 1)
                
                # Fallback: Process flat or scattered data
                else:
                    items = data if isinstance(data, list) else [data]
                    text_parts = []
                    
                    for item in items:
                        if isinstance(item, dict):
                            for k, v in item.items():
                                for snippet in clean_value(v):
                                    if snippet not in text_parts:
                                        text_parts.append(snippet)
                    
                    text = " \n ".join(text_parts)
                    
                    for item in items:
                        if isinstance(item, dict):
                            for k, v in item.items():
                                normalized_key = k.lower().strip()
                                if normalized_key in UNIVERSAL_MAP:
                                    label = UNIVERSAL_MAP[normalized_key]
                                    for val in clean_value(v):
                                        start_idx = text.find(val)
                                        while start_idx != -1:
                                            computed_offsets.append([start_idx, start_idx + len(val), label])
                                            start_idx = text.find(val, start_idx + 1)

                if not text.strip():
                    text = f"Empty record fallback for {filename}"
                
                payload = {"text": text, "entities": computed_offsets}
                outfile.write(json.dumps(payload) + "\n")
                compiled_count += 1

    print(f"\n✨ Success! Processed {compiled_count} files into {OUTPUT_FILE}")

if __name__ == "__main__":
    compile_data()