import os
import json
import re

RAW_DIR = "datasets/historical_converted/raw"
LABEL_DIR = "datasets/historical_converted/labels"

with open(
    "process_mapping.json",
    encoding="utf8"
) as f:

    PROCESS_MAP = json.load(f)

updated = 0

for file in os.listdir(LABEL_DIR):

    if not file.endswith(".json"):
        continue

    path = os.path.join(
        LABEL_DIR,
        file
    )

    with open(
        path,
        encoding="utf8"
    ) as f:

        row = json.load(f)

    text = row["text"]

    pid_match = re.search(
        r"\b(\d{6})\b",
        text
    )

    if not pid_match:
        continue

    process_id = pid_match.group(1)

    if process_id not in PROCESS_MAP:
        continue

    row["entities"] = PROCESS_MAP[process_id]

    with open(
        path,
        "w",
        encoding="utf8"
    ) as f:

        json.dump(
            row,
            f,
            indent=2,
            ensure_ascii=False
        )

    updated += 1

print()
print("UPDATED:", updated)