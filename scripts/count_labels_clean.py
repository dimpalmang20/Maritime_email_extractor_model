import os
import json
from collections import Counter

LABEL_DIR = "datasets/historical_converted/labels"

counter = Counter()

total_files = 0

for file in os.listdir(LABEL_DIR):

    if not file.endswith(".json"):
        continue

    path = os.path.join(
        LABEL_DIR,
        file
    )

    try:

        with open(
            path,
            encoding="utf8"
        ) as f:

            row = json.load(f)

        entities = row.get(
            "entities",
            {}
        )

        total_files += 1

        for label in entities:

            counter[label] += 1

    except Exception:
        pass

print()
print("=" * 50)
print("TOTAL FILES :", total_files)
print("=" * 50)
print()

for label, count in sorted(counter.items()):

    print(
        label.ljust(25),
        count
    )