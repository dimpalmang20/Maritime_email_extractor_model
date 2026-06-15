import json

count = 0

with open(
    "datasets/ner_train.jsonl",
    encoding="utf8"
) as f:

    for line in f:

        row = json.loads(line)

        if len(row["entities"]) == 0:

            count += 1

            print("\n====================")
            print("EMPTY RECORD")
            print("====================")

            print(row["text"][:800])

            if count >= 20:
                break