import json

from datasets import Dataset

from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    TrainingArguments,
    Trainer,
    DataCollatorForTokenClassification
)

MODEL_NAME = "distilbert-base-uncased"

NER_FILE = "datasets/ner_train_final.jsonl"

OUTPUT_DIR = "models/distilbert-maritime-ner"


records = []

with open(NER_FILE, encoding="utf8") as f:
    for line in f:
        records.append(json.loads(line))

print("Records:", len(records))


labels = set()

for row in records:
    for e in row["entities"]:
        labels.add(e[2])

label_list = ["O"]

for lbl in sorted(labels):
    label_list.append("B-" + lbl)
    label_list.append("I-" + lbl)

label2id = {x: i for i, x in enumerate(label_list)}
id2label = {i: x for x, i in label2id.items()}

print(label_list)


tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)


def convert_example(example):

    text = example["text"]

    entities = example["entities"]

    encoding = tokenizer(
        text,
        truncation=True,
        max_length=512,
        return_offsets_mapping=True
    )

    labels = []

    for offset in encoding["offset_mapping"]:

        start, end = offset

        if start == 0 and end == 0:
            labels.append(-100)
            continue

        tag = "O"

        for ent_start, ent_end, ent_label in entities:

            overlap = (
                start < ent_end
                and end > ent_start
            )

            if overlap:

                if start == ent_start:
                    tag = "B-" + ent_label
                else:
                    tag = "I-" + ent_label

                break

        labels.append(label2id[tag])

    encoding["labels"] = labels

    encoding.pop("offset_mapping")

    return encoding


processed = []

for r in records:
    processed.append(
        convert_example(r)
    )

dataset = Dataset.from_list(
    processed
)


model = AutoModelForTokenClassification.from_pretrained(
    MODEL_NAME,
    num_labels=len(label_list),
    id2label=id2label,
    label2id=label2id
)

args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    learning_rate=3e-5,                  # Perfect rate for fine-tuning DistilBERT
    per_device_train_batch_size=4,       # Stable batch step footprint
    num_train_epochs=30,                 # High epochs to ensure deep accuracy over your custom shipping phrases
    weight_decay=0.01,
    save_strategy="epoch",
    logging_steps=5,
    evaluation_strategy="no"             # Directs 100% of the dataset capacity into training features
)


trainer = Trainer(
    model=model,
    args=args,
    train_dataset=dataset,
    processing_class=tokenizer,
    data_collator=DataCollatorForTokenClassification(
        tokenizer
    )
)


trainer.train()

trainer.save_model(
    OUTPUT_DIR
)

tokenizer.save_pretrained(
    OUTPUT_DIR
)

print("DONE")