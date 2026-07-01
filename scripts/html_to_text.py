from bs4 import BeautifulSoup
import os

INPUT_DIR = "datasets/extracted_email_dump"

OUTPUT_DIR = "datasets/historical_converted/raw"

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)

counter = 1501

for file in sorted(os.listdir(INPUT_DIR)):

    if not file.endswith(".html"):
        continue

    path = os.path.join(
        INPUT_DIR,
        file
    )

    try:

        with open(
            path,
            "r",
            encoding="utf8",
            errors="ignore"
        ) as f:

            html = f.read()

        soup = BeautifulSoup(
            html,
            "html.parser"
        )

        text = soup.get_text(
            "\n",
            strip=True
        )

        output_file = os.path.join(
            OUTPUT_DIR,
            f"email_{counter:04d}.txt"
        )

        with open(
            output_file,
            "w",
            encoding="utf8"
        ) as out:

            out.write(text)

        counter += 1

    except Exception as e:

        print(
            "ERROR:",
            file,
            e
        )

print()
print(
    "TXT FILES CREATED:",
    counter - 1501
)