import os
import json

OUTPUT_FILE = "datasets/final_merged.jsonl"

FOLDERS = [

    "datasets/gold_labels",
    "datasets/historical_converted/labels"

]

total = 0

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf8"
) as out:

    for folder in FOLDERS:

        if not os.path.exists(folder):
            continue

        for file in os.listdir(folder):

            if not file.endswith(".json"):
                continue

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

                out.write(
                    json.dumps(
                        row,
                        ensure_ascii=False
                    )
                    + "\n"
                )

                total += 1

            except:
                pass

print()
print(
    "TOTAL MERGED:",
    total
)

print(
    "OUTPUT:",
    OUTPUT_FILE
)