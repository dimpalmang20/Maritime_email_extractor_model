from transformers import AutoTokenizer
from transformers import AutoModelForTokenClassification

import torch

MODEL_PATH = "models/distilbert-maritime-ner"

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_PATH
)

model = AutoModelForTokenClassification.from_pretrained(
    MODEL_PATH
)

with open(
    "scripts/test_email.txt",
    "r",
    encoding="utf8"
) as f:
    text = f.read()

inputs = tokenizer(
    text,
    return_tensors="pt",
    truncation=True
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

print("\nPREDICTED ENTITIES:\n")

for token, pred in zip(
    tokens,
    predictions[0]
):

    label = model.config.id2label[
        pred.item()
    ]

    if (
        label != "O"
        and token not in ["[CLS]", "[SEP]", "[PAD]"]
    ):

        print(
            token,
            "->",
            label
        )