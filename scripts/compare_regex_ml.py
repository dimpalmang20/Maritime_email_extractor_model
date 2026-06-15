import json

print("=" * 60)
print("REGEX OUTPUT")
print("=" * 60)

with open(
    "regex_output.json",
    "r",
    encoding="utf8"
) as f:

    regex_result = json.load(f)

print(
    json.dumps(
        regex_result,
        indent=2
    )
)

print()

print("=" * 60)
print("ML OUTPUT")
print("=" * 60)

with open(
    "ml_output.json",
    "r",
    encoding="utf8"
) as f:

    ml_result = json.load(f)

print(
    json.dumps(
        ml_result,
        indent=2
    )
)