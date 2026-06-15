from transformers import AutoTokenizer
from transformers import AutoModelForTokenClassification
import torch

MODEL_PATH = "models/distilbert-maritime-ner"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

model = AutoModelForTokenClassification.from_pretrained(
    MODEL_PATH
)

text = "60000 MT GRAIN IN BULK RUSSA B SEA MED SEA 20-25 JULY 2025"

inputs = tokenizer(
    text,
    return_tensors="pt"
)

with torch.no_grad():

    outputs = model(**inputs)

predictions = torch.argmax(
    outputs.logits,
    dim=2
)

tokens = tokenizer.convert_ids_to_tokens(
    inputs["input_ids"][0]
)

print()

for token,pred in zip(
    tokens,
    predictions[0]
):

    label = model.config.id2label[
        pred.item()
    ]

    print(
        token,
        "->",
        label
    )