from transformers import DistilBertTokenizerFast

tokenizer = DistilBertTokenizerFast.from_pretrained(
    "distilbert-base-uncased"
)

tokenizer.save_pretrained(
    "models/distilbert-maritime-ner"
)

print("DONE")