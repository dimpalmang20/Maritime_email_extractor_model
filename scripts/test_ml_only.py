import sys
import os
import json

sys.path.append(
    os.path.abspath("src/ml")
)

from distilbert_extract import extract_entities

email_file = sys.argv[1]

with open(email_file, encoding="utf8", errors="ignore") as f:
    text = f.read()

result = extract_entities(text)

print(json.dumps(result, indent=2))