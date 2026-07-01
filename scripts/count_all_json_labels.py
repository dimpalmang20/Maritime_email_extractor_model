import os
import json
from collections import Counter

counter = Counter()

folders = [

    "datasets/gold_labels",
    "datasets/historical_converted/labels"

]

total_files = 0

for folder in folders:

    if not os.path.exists(folder):
        continue

    for file in os.listdir(folder):

        if not file.endswith(".json"):
            continue

        total_files += 1

        path = os.path.join(
            folder,
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

            for label in entities:

                value = entities[label]

                if value:

                    counter[label] += 1

        except:
            pass

print()
print("=" * 50)

print(
    "TOTAL FILES :",
    total_files
)

print("=" * 50)

for label, count in sorted(counter.items()):

    print(
        label.ljust(25),
        count
    )