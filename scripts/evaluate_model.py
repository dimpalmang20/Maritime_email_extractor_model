import json

from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    pipeline
)

MODEL_PATH = "models/distilbert-maritime-ner"
NER_FILE = "datasets/ner_train.jsonl"

print("Loading model...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

model = AutoModelForTokenClassification.from_pretrained(
    MODEL_PATH
)

ner = pipeline(
    "token-classification",
    model=model,
    tokenizer=tokenizer,
    aggregation_strategy="simple"
)

total_entities = 0
correct_entities = 0

with open(NER_FILE, encoding="utf8") as f:

    for line in f:

        row = json.loads(line)

        text = row["text"]
        gold_entities = row["entities"]

        predictions = ner(text)

        predicted_labels = set()

        for p in predictions:

            predicted_labels.add(
                p["entity_group"]
            )

        for ent in gold_entities:

            gold_label = ent[2]

            total_entities += 1

            if gold_label in predicted_labels:
                correct_entities += 1

accuracy = (
    correct_entities / total_entities
    if total_entities > 0
    else 0
)

print()
print("Total Entities:", total_entities)
print("Correct Entities:", correct_entities)
print("Entity Accuracy:", round(accuracy * 100, 2), "%")