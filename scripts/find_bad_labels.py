import json

BAD = {
    "cargo_name",
    "dwt",
    "email_id",
    "matching_region",
    "phone_number",
    "pic",
    "port",
    "region",
    "tonnage_name",
    "tonnage_type"
}

with open("datasets/ner_train.jsonl", "r", encoding="utf8") as f:

    for line_no, line in enumerate(f, start=1):

        row = json.loads(line)

        for ent in row["entities"]:

            label = ent[2]

            if label in BAD:

                print(
                    "LINE:",
                    line_no,
                    "LABEL:",
                    label
                )