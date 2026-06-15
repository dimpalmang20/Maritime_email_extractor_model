import json
import sys
import os

sys.path.append(
    os.path.abspath("src/ml")
)

from maritime_ml_service import fill_missing_fields

regex_result = {
    "cargo": "grain",
    "load_port": None,
    "discharge_port": None,
    "quantity": None,
    "laycan": None
}

with open(
    "scripts/test_email.txt",
    "r",
    encoding="utf8"
) as f:

    email_text = f.read()

result = fill_missing_fields(
    regex_result,
    email_text
)

print(
    json.dumps(
        result,
        indent=2
    )
)