import json
from collections import Counter

counter = Counter()

with open("datasets/ner_train.jsonl", encoding="utf8") as f:
    for line in f:
        row = json.loads(line)

        for ent in row["entities"]:
            counter[ent[2]] += 1

print("\nEntity Counts:\n")

for k, v in sorted(counter.items()):
    print(k, ":", v)