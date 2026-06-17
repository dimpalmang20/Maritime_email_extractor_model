import os

from transformers import (
    DistilBertTokenizerFast,
    AutoModelForTokenClassification,
    pipeline
)

MODEL_PATH = "models/distilbert-maritime-ner"

TEST_EMAIL = "tests/email3.txt"

if not os.path.exists(MODEL_PATH):
    print("Model folder not found")
    exit()

print("[+] Loading trained weights...")

tokenizer = DistilBertTokenizerFast.from_pretrained(
    "distilbert-base-uncased"
)

model = AutoModelForTokenClassification.from_pretrained(
    MODEL_PATH
)

ner = pipeline(
    "token-classification",
    model=model,
    tokenizer=tokenizer,
    aggregation_strategy="simple"
)

with open(
    TEST_EMAIL,
    "r",
    encoding="utf8",
    errors="ignore"
) as f:
    sample_text = f.read()

results = ner(sample_text)

print("\n===== ENTITIES =====")

for r in results:
    print(
        r["entity_group"],
        "|",
        r["word"],
        "|",
        round(r["score"], 3)
    )