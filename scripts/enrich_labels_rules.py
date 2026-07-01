import os
import json
import re

LABEL_DIR = "datasets/historical_converted/labels"

updated = 0

vessel_patterns = [

    r"\bMV[\.\s]+([A-Z0-9\- ]{3,50})",

    r"\bm/v[\.\s]+([A-Z0-9\- ]{3,50})",

    r"\bM/V[\.\s]+([A-Z0-9\- ]{3,50})"

]

for file in os.listdir(LABEL_DIR):

    if not file.endswith(".json"):
        continue

    path = os.path.join(
        LABEL_DIR,
        file
    )

    try:

        with open(
            path,
            encoding="utf8"
        ) as f:

            row = json.load(f)

        text = row.get(
            "text",
            ""
        )

        entities = row.get(
            "entities",
            {}
        )
        if not entities.get("DWT"):

            m = re.search(
                r"(\d{1,3}[,\.]?\d{3})\s*(MT\s*)?DWT",
                 text,
                re.I
            )

            if m:

                entities["DWT"] = (
            m.group(1)
            .replace(",", "")
                )


        if not entities.get("IMO"):

            m = re.search(
             r"IMO(?:\s*NO)?\s*[:\-]?\s*(\d{7})",
             text,
             re.I
            )

            if m:

                entities["IMO"] = m.group(1)    


        if not entities.get("EMAIL"):

            emails = re.findall(
            r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
            text
            )

            if emails:

                entities["EMAIL"] = emails[0] 


        if not entities.get("PHONE"):

            phones = re.findall(
                r"\+?\d[\d\s\-]{8,20}",
                text
            )

            if phones:

                entities["PHONE"] = phones[0]  

        if not entities.get("OPEN_PORT"):

            m = re.search(
            r"OPEN\s+([A-Z][A-Z\s\-]{2,40})",
            text,
            re.I
            )

            if m:

                entities["OPEN_PORT"] = (
                m.group(1)
                .strip()
                )                 

        if not entities.get("VESSEL"):

            for pat in vessel_patterns:

                m = re.search(
                    pat,
                    text,
                    re.I
                )

                if m:

                    vessel = (
                        "MV "
                        + m.group(1)
                    )

                    vessel = vessel.strip()

                    entities["VESSEL"] = vessel

                    updated += 1

                    break

        row["entities"] = entities

        with open(
            path,
            "w",
            encoding="utf8"
        ) as f:

            json.dump(
                row,
                f,
                indent=2,
                ensure_ascii=False
            )

    except:
        pass

print()
print("UPDATED:", updated)