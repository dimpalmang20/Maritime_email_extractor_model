import json
from collections import Counter

counter = Counter()

with open(
    "datasets/ner_train_clean.jsonl",
    encoding="utf8"
) as f:

    for line in f:

        row = json.loads(line)

        for ent in row["entities"]:

            counter[ent[2]] += 1

print("\nLABEL COUNTS\n")

for label, count in sorted(counter.items()):

    print(
        label.ljust(20),
        count
    )