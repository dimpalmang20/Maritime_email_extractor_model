import os
import json
import requests

RAW_FOLDER = "datasets/raw_emails"
LABEL_FOLDER = "datasets/labels"

os.makedirs(LABEL_FOLDER, exist_ok=True)

files = sorted(
    [f for f in os.listdir(RAW_FOLDER) if f.endswith(".txt")]
)

for file in files:

    num = file.replace("email_", "").replace(".txt", "")

    if int(num) < 40:
        continue

    txt_path = os.path.join(RAW_FOLDER, file)

    with open(txt_path, "r", encoding="utf-8", errors="ignore") as f:
        email_text = f.read()

    try:

        response = requests.post(
            "http://localhost:3000/extract",
            json={"emailBody": email_text},
            timeout=30
        )

        result = response.json()

        json_name = f"email_{int(num):03d}.json"

        out_path = os.path.join(
            LABEL_FOLDER,
            json_name
        )

        with open(out_path, "w", encoding="utf-8") as jf:
            json.dump(
                result,
                jf,
                indent=2,
                ensure_ascii=False
            )

        print("Saved", json_name)

    except Exception as e:
        print("Failed", file, e)

print("DONE")