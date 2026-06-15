import json

INPUT_FILE = "datasets/ner_train.jsonl"
OUTPUT_FILE = "datasets/ner_train_final.jsonl"

MAP = {
    "account_name":"CHARTERER",
    "cargo_name":"CARGO",
    "load_port":"LOAD_PORT",
    "discharge_port":"DISCHARGE_PORT",
    "dwt":"DWT",
    "pic":"CONTACT",
    "email_id":"CONTACT",
    "phone_number":"CONTACT",
    "port":"PORT",
    "region":"PORT",
    "tonnage_name":"VESSEL",
    "tonnage_type":"VESSEL_TYPE",
    "matching_region":"PORT",
    "restrictions":"RESTRICTIONS",

    "OPEN_DATE":"ETA",

    "email_type":"REMOVE",
    "max_size":"REMOVE",
    "min_size":"REMOVE"
}

with open(INPUT_FILE, "r", encoding="utf8") as fin, \
     open(OUTPUT_FILE, "w", encoding="utf8") as fout:

    for line in fin:

        row = json.loads(line)

        cleaned_entities = []

        for ent in row["entities"]:

            start, end, label = ent

            label = MAP.get(label, label)

            # skip unwanted labels
            if label == "REMOVE":
                continue

            cleaned_entities.append([
                start,
                end,
                label
            ])

        row["entities"] = cleaned_entities

        fout.write(
            json.dumps(
                row,
                ensure_ascii=False
            )
        )

        fout.write("\n")

print("DONE")