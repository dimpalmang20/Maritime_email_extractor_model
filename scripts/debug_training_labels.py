import json
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained(
    "distilbert-base-uncased"
)

with open(
    "datasets/ner_train.jsonl",
    encoding="utf8"
) as f:

    row = json.loads(next(f))

text = row["text"]
entities = row["entities"]

encoding = tokenizer(
    text,
    truncation=True,
    max_length=512,
    return_offsets_mapping=True
)

count = 0

for start_token, end_token in encoding["offset_mapping"]:

    for ent_start, ent_end, ent_label in entities:

        if (
            start_token >= ent_start
            and start_token < ent_end
        ):
            count += 1
            break

print("Matched Tokens:", count)
print("Total Tokens:", len(encoding["offset_mapping"]))