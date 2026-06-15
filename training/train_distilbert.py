import json
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    TrainingArguments,
    Trainer,
)

MODEL_NAME = "distilbert-base-uncased"

texts = []

with open("datasets/ner_train.jsonl", encoding="utf8") as f:
    for line in f:
        row = json.loads(line)
        texts.append(row["text"])

dataset = Dataset.from_dict({
    "text": texts
})

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

model = AutoModelForTokenClassification.from_pretrained(
    MODEL_NAME,
    num_labels=10
)

training_args = TrainingArguments(
    output_dir="models/distilbert-maritime-ner",
    num_train_epochs=5,
    per_device_train_batch_size=4,
    save_strategy="epoch",
    logging_steps=10,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
)

trainer.train()

trainer.save_model(
    "models/distilbert-maritime-ner"
)

print("Training Finished")