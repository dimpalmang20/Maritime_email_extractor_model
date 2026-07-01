import json
import os
import sys
import traceback
from pathlib import Path

from transformers import (
    DistilBertTokenizerFast,
    AutoModelForTokenClassification,
    pipeline
)

REPO_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = str(REPO_ROOT / "models" / "distilbert-maritime-ner")

# Load tokenizer and model with an absolute path so runtime path issues are avoided.
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


def extract_entities(text):
    if text is None:
        text = ""

    text = text.strip()
    text_length = len(text)
    words = text.split()

    if len(words) == 0:
        return {}

    output = {}
    chunks = []
    CHUNK_TOKEN_LIMIT = 450

    current_chunk_words = []
    current_token_count = 0

    for word in words:
        token_ids = tokenizer(word, add_special_tokens=False).input_ids
        token_count = len(token_ids)
        if token_count == 0:
            continue

        if current_chunk_words and current_token_count + token_count + 1 > CHUNK_TOKEN_LIMIT:
            chunks.append(" ".join(current_chunk_words))
            current_chunk_words = []
            current_token_count = 0

        current_chunk_words.append(word)
        current_token_count += token_count + 1

    if current_chunk_words:
        chunks.append(" ".join(current_chunk_words))

    def _json_serialize(value):
        if isinstance(value, (float, int, str, bool)) or value is None:
            return value
        if hasattr(value, "item"):
            return value.item()
        if isinstance(value, bytes):
            return value.decode("utf8", "ignore")
        return str(value)

    for index, chunk in enumerate(chunks, start=1):
        try:
            results = ner(chunk)

            for r in results:
                score = float(r.get("score", 0))
                label = r.get("entity_group") or r.get("entity")
                value = r.get("word", "")

                if score < 0.15:
                    continue

                if not label or not value:
                    continue

                value = value.replace("##", "").strip()
                value = value.replace("  ", " ").strip()

                if not value:
                    continue

                if label not in output:
                    output[label] = []

                if value not in output[label]:
                    output[label].append(value)

        except Exception:
            continue

    return output


if __name__ == "__main__":
    sample = """
    60000 MT GRAIN IN BULK
    RUSSA B SEA / MED SEA
    20-25 JULY 2025
    """
    print(extract_entities(sample))