import json

BAD = {
    "email_id",
    "pic",
    "phone_number"
}

INPUT_FILE = "datasets/ner_train_clean.jsonl"
OUTPUT_FILE = "datasets/ner_train_final.jsonl"

count_removed = 0

with open(INPUT_FILE, encoding="utf8") as fin, \
     open(OUTPUT_FILE, "w", encoding="utf8") as fout:

    for line in fin:

        row = json.loads(line)

        new_entities = []

        for ent in row["entities"]:

            if ent[2] not in BAD:
                new_entities.append(ent)
            else:
                count_removed += 1

        row["entities"] = new_entities

        fout.write(
            json.dumps(
                row,
                ensure_ascii=False
            )
        )

        fout.write("\n")

print("REMOVED:", count_removed)
print("DONE")