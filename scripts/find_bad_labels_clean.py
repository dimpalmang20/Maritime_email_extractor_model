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

found = False

with open(
    "datasets/ner_train_clean.jsonl",
    encoding="utf8"
) as f:

    for line_no, line in enumerate(f, start=1):

        row = json.loads(line)

        for ent in row["entities"]:

            if ent[2] in BAD:

                found = True

                print(
                    "LINE",
                    line_no,
                    ent[2]
                )

if not found:
    print("NO BAD LABELS FOUND")