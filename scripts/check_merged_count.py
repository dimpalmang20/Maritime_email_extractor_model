import json

count = 0

with open(
    "datasets/ner_train_final.jsonl",
    encoding="utf8"
) as f:

    for line in f:
        count += 1

print()
print("=" * 50)
print("TOTAL RECORDS:", count)
print("=" * 50)
print()