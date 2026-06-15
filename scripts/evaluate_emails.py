import os
from transformers import pipeline

MODEL_PATH = "models/distilbert-maritime-ner"

ner = pipeline(
    "token-classification",
    model=MODEL_PATH,
    tokenizer=MODEL_PATH,
    aggregation_strategy="simple"
)

TEST_DIR = "tests"

for file in os.listdir(TEST_DIR):

    if not file.endswith(".txt"):
        continue

    path = os.path.join(TEST_DIR, file)

    with open(path, encoding="utf8") as f:
        text = f.read()

    print("\n")
    print("=" * 60)
    print(file)
    print("=" * 60)

    results = ner(text)

    for r in results:

        print(
            r["entity_group"],
            "=>",
            r["word"]
        )