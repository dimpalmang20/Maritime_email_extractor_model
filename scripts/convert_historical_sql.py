import os
import json
import re

SQL_DIR = "datasets/historical_sql"

RAW_OUT = "datasets/historical_converted/raw"
LABEL_OUT = "datasets/historical_converted/labels"

os.makedirs(RAW_OUT, exist_ok=True)
os.makedirs(LABEL_OUT, exist_ok=True)

counter = 1501


def save_record(text, entities):

    global counter

    txt_file = f"email_{counter:04d}.txt"
    json_file = f"email_{counter:04d}.json"

    with open(
        os.path.join(RAW_OUT, txt_file),
        "w",
        encoding="utf8"
    ) as f:
        f.write(text)

    with open(
        os.path.join(LABEL_OUT, json_file),
        "w",
        encoding="utf8"
    ) as f:

        json.dump(
            {
                "text": text,
                "entities": entities
            },
            f,
            indent=2,
            ensure_ascii=False
        )

    counter += 1


# ===========================
# TONNAGE
# ===========================

tonnage_file = os.path.join(
    SQL_DIR,
    "tonnage_old.sql"
)

if os.path.exists(tonnage_file):

    with open(
        tonnage_file,
        encoding="utf8",
        errors="ignore"
    ) as f:

        data = f.read()

    pattern = re.findall(
        r"\((.*?)\)",
        data,
        re.S
    )

    for row in pattern:

        if "MV" not in row:
            continue

        text = row

        vessel = None
        dwt = None
        port = None

        m = re.search(
            r"'(MV[^']*)'",
            row,
            re.I
        )

        if m:
            vessel = m.group(1)

        m = re.search(
            r",\s*(\d{4,6})\s*,",
            row
        )

        if m:
            dwt = m.group(1)

        entities = {
            "VESSEL": vessel,
            "DWT": dwt,
            "PORT": port
        }

        save_record(
            text,
            entities
        )


# ===========================
# CARGO VC
# ===========================

cargo_vc_file = os.path.join(
    SQL_DIR,
    "cargo_vc_old.sql"
)

if os.path.exists(cargo_vc_file):

    with open(
        cargo_vc_file,
        encoding="utf8",
        errors="ignore"
    ) as f:

        data = f.read()

    rows = re.findall(
        r"\((.*?)\)",
        data,
        re.S
    )

    for row in rows:

        if "Dry Bulk" not in row \
           and "General Cargo" not in row:
            continue

        text = row

        entities = {
            "CARGO": None,
            "LOAD_PORT": None,
            "DISCHARGE_PORT": None
        }

        save_record(
            text,
            entities
        )


# ===========================
# CARGO TC
# ===========================

cargo_tc_file = os.path.join(
    SQL_DIR,
    "cargo_tc_old.sql"
)

if os.path.exists(cargo_tc_file):

    with open(
        cargo_tc_file,
        encoding="utf8",
        errors="ignore"
    ) as f:

        data = f.read()

    rows = re.findall(
        r"\((.*?)\)",
        data,
        re.S
    )

    for row in rows:

        if "Dry Bulk" not in row \
           and "General Cargo" not in row:
            continue

        text = row

        entities = {
            "CARGO": None,
            "LOAD_PORT": None,
            "DISCHARGE_PORT": None
        }

        save_record(
            text,
            entities
        )

print()
print("DONE")
print("Generated:", counter - 1501)