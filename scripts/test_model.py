from transformers import AutoTokenizer
from transformers import AutoModelForTokenClassification
from transformers import pipeline

MODEL_PATH = "models/distilbert-maritime-ner"

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

with open(
    "tests/email3.txt",
    "r",
    encoding="utf8",
    errors="ignore"
) as f:
    sample_text = f.read()

results = ner(sample_text)

print("TOTAL RESULTS:", len(results))

print(results)