import json
import os

LABEL_DIR = "datasets/historical_converted/labels"

with open(
    "process_mapping.json",
    encoding="utf8"
) as f:
    process_map = json.load(f)

with open(
    "sql_to_json_mapping.json",
    encoding="utf8"
) as f:
    sql_map = json.load(f)

updated = 0

for process_id, email_file in sql_map.items():

    if process_id not in process_map:
        continue

    label_path = os.path.join(
        LABEL_DIR,
        email_file
    )

    if not os.path.exists(label_path):
        continue

    try:

        with open(
            label_path,
            encoding="utf8"
        ) as f:
            row = json.load(f)

        if "entities" not in row:
            row["entities"] = {}

        for k, v in process_map[process_id].items():

            if (
                v
                and str(v).strip()
            ):
                row["entities"][k] = str(v)

        with open(
            label_path,
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

    except Exception as e:
        print(e)

print()
print("UPDATED:", updated)