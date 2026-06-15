import json

with open(
    "datasets/ner_train.jsonl",
    encoding="utf8"
) as f:

    first = json.loads(next(f))

text = first["text"]

for start, end, label in first["entities"]:
    print()
    print(label)
    print("SPAN:", start, end)
    print("TEXT:", repr(text[start:end]))