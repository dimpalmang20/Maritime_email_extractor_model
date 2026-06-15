from transformers import pipeline

MODEL_PATH = "models/distilbert-maritime-ner"

ner = pipeline(
    "token-classification",
    model=MODEL_PATH,
    tokenizer=MODEL_PATH,
    aggregation_strategy="simple"
)

with open(
    "scripts/test_email.txt",
    "r",
    encoding="utf8"
) as f:
    text = f.read()

results = ner(text)

print("\nJSON OUTPUT\n")

for r in results:

    print(
        r["entity_group"],
        "=>",
        r["word"]
    )