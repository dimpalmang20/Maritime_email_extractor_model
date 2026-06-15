import json
import sys
import os

sys.path.append(
    os.path.abspath("src/ml")
)

from merge_results import merge

with open("regex_output.json","r",encoding="utf8") as f:
    regex_data = json.load(f)

with open("ml_output.json","r",encoding="utf-8-sig", errors="ignore") as f:
    ml_data = json.load(f)

merged = merge(
    regex_data,
    ml_data
)

print("\nFINAL RESULT\n")

print(
    json.dumps(
        merged,
        indent=2
    )
)