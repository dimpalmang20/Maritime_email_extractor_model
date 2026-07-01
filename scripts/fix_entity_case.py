import os
import json

FOLDERS = [

    "datasets/gold_labels",
    "datasets/historical_converted/labels"

]

mapping = {

    "port": "PORT",
    "region": "REGION",
    "matching_region": "MATCHING_REGION",

    "load_port": "LOAD_PORT",
    "discharge_port": "DISCHARGE_PORT",

    "open_date": "OPEN_DATE",
    "close_date": "CLOSE_DATE",

    "tonnage_type": "TONNAGE_TYPE",
    "cargo_type": "CARGO_TYPE",

    "cargo_name": "CARGO",
    "tonnage_name": "VESSEL",

    "email_id": "EMAIL",
    "phone_number": "PHONE",

    "email_type": "EMAIL_TYPE",

    "laycan_start_date": "LAYCAN_START",
    "laycan_end_date": "LAYCAN_END",

    "min_size": "MIN_SIZE",
    "max_size": "MAX_SIZE",

    "restrictions":"RESTRICTIONS",
    "dwt":"DWT",
    "account_name": "BROKER",
    "pic": "CONTACT"
}

updated = 0

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

            entities = row.get(
                "entities",
                {}
            )

            changed = False

            for old_key, new_key in mapping.items():

                if old_key in entities:

                    value = entities.pop(
                        old_key
                    )

                    if (
                        value
                        and
                        new_key not in entities
                    ):

                        entities[new_key] = value

                    changed = True

            if changed:

                row["entities"] = entities

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

        except:
            pass

print()
print(
    "UPDATED:",
    updated
)