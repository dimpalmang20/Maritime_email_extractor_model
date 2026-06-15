import json

records = []

with open("datasets/ner_train.jsonl", encoding="utf8") as f:
    for line in f:
        records.append(json.loads(line))

print("Total records:", len(records))

for i, row in enumerate(records):

    if "text" not in row:
        print("Missing text:", i)
        continue

    if "entities" not in row:
        print("Missing entities:", i)
        continue

    for ent in row["entities"]:

        if len(ent) != 3:
            print("Bad entity:", i, ent)
            quit()

        if not isinstance(ent[0], int):
            print("Start not int:", i, ent)
            quit()

        if not isinstance(ent[1], int):
            print("End not int:", i, ent)
            quit()

        if not isinstance(ent[2], str):
            print("Label not str:", i, ent)
            quit()

print("Dataset structure OK")