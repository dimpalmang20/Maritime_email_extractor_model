import json
import random

random.seed(42)

with open("datasets/ner_train.jsonl", encoding="utf8") as f:
    data = [json.loads(x) for x in f]

random.shuffle(data)

split = int(len(data) * 0.9)

train = data[:split]
test = data[split:]

with open("datasets/train.jsonl", "w", encoding="utf8") as f:
    for row in train:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")

with open("datasets/test.jsonl", "w", encoding="utf8") as f:
    for row in test:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")

print("Train:", len(train))
print("Test :", len(test))