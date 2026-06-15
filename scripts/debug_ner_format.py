import json

with open("datasets/ner_train.jsonl", encoding="utf8") as f:

    for i, line in enumerate(f, start=1):

        row = json.loads(line)

        entities = row.get("entities", [])

        if not isinstance(entities, list):
            print(f"Line {i}: entities is not list")
            print(type(entities))
            break

        for ent in entities:

            if not isinstance(ent, list):
                print(f"Line {i}: entity not list")
                print(ent)
                quit()

            if len(ent) != 3:
                print(f"Line {i}: bad entity length")
                print(ent)
                quit()

            if not isinstance(ent[0], int):
                print(f"Line {i}: start not int")
                print(ent)
                quit()

            if not isinstance(ent[1], int):
                print(f"Line {i}: end not int")
                print(ent)
                quit()

            if not isinstance(ent[2], str):
                print(f"Line {i}: label not str")
                print(ent)
                quit()

print("NER format OK")