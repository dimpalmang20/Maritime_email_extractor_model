from transformers import AutoTokenizer
from transformers import AutoModelForTokenClassification

tokenizer = AutoTokenizer.from_pretrained(
    "models/distilbert-maritime-ner"
)

model = AutoModelForTokenClassification.from_pretrained(
    "models/distilbert-maritime-ner"
)

print("MODEL LOADED SUCCESSFULLY")