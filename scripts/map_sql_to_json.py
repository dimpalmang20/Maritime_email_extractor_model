import os
import json

# load process mapping

with open(
    "process_mapping.json",
    encoding="utf8"
) as f:

    process_data = json.load(f)

mapping = {}

labels_folder = "datasets/historical_converted/labels"

all_json_files = []

for file in os.listdir(labels_folder):

    if file.endswith(".json"):

        all_json_files.append(file)

print("json files:", len(all_json_files))

for process_id, info in process_data.items():

    vessel = str(
        info.get("VESSEL", "")
    ).strip().lower()

    if not vessel:
        continue

    for json_file in all_json_files:

        path = os.path.join(
            labels_folder,
            json_file
        )

        try:

            with open(
                path,
                encoding="utf8"
            ) as f:

                data = json.load(f)

            text = str(
                data.get("text", "")
            ).lower()

            if vessel in text:

                mapping[process_id] = json_file

                print(
                    process_id,
                    "->",
                    json_file,
                    "->",
                    vessel
                )

                break

        except Exception:
            pass

with open(
    "sql_to_json_mapping.json",
    "w",
    encoding="utf8"
) as f:

    json.dump(
        mapping,
        f,
        indent=2
    )

print()
print("matches:", len(mapping))