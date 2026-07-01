import os
import re

SQL_FILE = "datasets/historical_sql/processed_emails_old.sql"

OUT_DIR = "datasets/extracted_email_dump"

os.makedirs(OUT_DIR, exist_ok=True)

count = 0

with open(
    SQL_FILE,
    "r",
    encoding="utf8",
    errors="ignore"
) as f:

    for line in f:

        if "<html" not in line.lower():
            continue

        process_match = re.search(
            r"'(\d{6})'",
            line
        )

        if not process_match:
            continue

        process_id = process_match.group(1)

        html_match = re.search(
            r"'(<html.*)</html>'",
            line,
            re.IGNORECASE
        )

        if not html_match:
            continue

        html = html_match.group(1) + "</html>"

        html = html.replace("\\r", "\r")
        html = html.replace("\\n", "\n")
        html = html.replace('\\"', '"')

        out_file = os.path.join(
            OUT_DIR,
            f"{process_id}.html"
        )

        with open(
            out_file,
            "w",
            encoding="utf8",
            errors="ignore"
        ) as out:

            out.write(html)

        count += 1

print()
print("HTML FILES SAVED:", count)