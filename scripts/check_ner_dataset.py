import json
from collections import Counter

counter = Counter()

records = 0

with open(
    "datasets/ner_train_final.jsonl",
    encoding="utf8"
) as f:

    for line in f:

        row = json.loads(line)

        records += 1

        for ent in row["entities"]:

            counter[ent[2]] += 1

print()
print("=" * 50)
print("TOTAL RECORDS:", records)
print("=" * 50)
print()

for label, count in sorted(counter.items()):

    print(
        label.ljust(25),
        count
    )