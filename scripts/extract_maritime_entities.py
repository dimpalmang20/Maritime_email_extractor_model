import os
import json
import re

LABEL_DIR = "datasets/historical_converted/labels"

updated = 0

for file in os.listdir(LABEL_DIR):

    if not file.endswith(".json"):
        continue

    path = os.path.join(LABEL_DIR, file)

    try:

        with open(path, encoding="utf8") as f:
            row = json.load(f)

        text = row["text"]

        entities = row.get("entities", {})

        changed = False

        # --------------------------------
        # VESSEL
        # --------------------------------

        vessel_patterns = [

            r"MV\s+([A-Z0-9\- ]{3,40})",

            r"M/V\s+([A-Z0-9\- ]{3,40})",

            r"m/v\s+([A-Z0-9\- ]{3,40})"

        ]

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

                    vessel = vessel.split("\n")[0]

                    vessel = vessel.strip()

                    entities["VESSEL"] = vessel

                    changed = True

                    break

        # --------------------------------
        # DWT
        # --------------------------------

        if not entities.get("DWT"):

            m = re.search(
                r"DWT[: ]+([\d,\.]+)",
                text,
                re.I
            )

            if m:

                entities["DWT"] = (
                    m.group(1)
                    .replace(",", "")
                )

                changed = True

        # --------------------------------
        # IMO
        # --------------------------------

        if not entities.get("IMO"):

            imo_patterns = [

        r"IMO(?:\s*NO)?\s*[:\-]?\s*(\d{7})",

        r"IMO NUMBER\s*[:\-]?\s*(\d{7})",

        r"IMO#\s*(\d{7})"

            ]

            for pat in imo_patterns:

                m = re.search(
            pat,
            text,
            re.I
                )

                if m:

                    entities["IMO"] = m.group(1)

                    changed = True
                    break

        # --------------------------------
        # LOAD PORT
        # --------------------------------

        if not entities.get("LOAD_PORT"):
            load_patterns = [

        r"LOAD PORT\s*[:\-]\s*(.+)",

        r"LD/P\s*[:\-]\s*(.+)",

        r"LOADING PORT\s*[:\-]\s*(.+)"

            ]

            for pat in load_patterns:
                m = re.search(
                pat,
                text,
                re.I
                )

                if m:

                    entities["LOAD_PORT"] = (
                    m.group(1)
                    .split("\n")[0]
                    .strip()
                )

                changed = True
                break
        # --------------------------------
        # OPEN DATE
        # --------------------------------

        if not entities.get("OPEN_DATE"):

            m = re.search(
                r"OPEN.*?(\d{1,2})[/\-](\d{1,2})\s*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)",
                text,
                re.I
            )

            if m:

                entities["OPEN_DATE"] = (
                f"{m.group(1)} {m.group(3)}"
                )

                entities["CLOSE_DATE"] = (
                f"{m.group(2)} {m.group(3)}"
                )

                changed = True
        # --------------------------------
        # DISCHARGE PORT
        # --------------------------------

        if not entities.get("DISCHARGE_PORT"):
            dis_patterns = [

        r"DISCHARGE PORT\s*[:\-]\s*(.+)",

        r"DC/P\s*[:\-]\s*(.+)",

        r"DISCH PORT\s*[:\-]\s*(.+)"

            ]
            for pat in dis_patterns:

                m = re.search(
                r"DISCHARGE PORT\s*[:\-]\s*(.+)",
                text,
                re.I
                )

                if m:

                    entities["DISCHARGE_PORT"] = (
                    m.group(1)
                    .split("\n")[0]
                    .strip()
                    )

                    changed = True
                    break

        if not entities.get("EMAIL"):

            from_match = re.search(
        r"From:.*?<([^>]+)>",
        text,
        re.I | re.S
            )

            if from_match:

                entities["EMAIL"] = (
            from_match.group(1)
            .strip()
                )

            else:

                emails = re.findall(
            r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
            text
                )

                if emails:

                    entities["EMAIL"] = emails[-1]

            changed = True

        if not entities.get("PHONE"):

            phones = re.findall(
                r"\+\d[\d\s\-]{8,20}",
                text
            )

            if phones:

                entities["PHONE"] = (
                     phones[-1]
                     .strip()
                )            

         # --------------------------------
         # BROKER
        # --------------------------------

        if not entities.get("BROKER"):

            broker_patterns = [

        r"Best Regards[,:\s]*\n([A-Z][A-Za-z .]+)",

        r"Kind Regards[,:\s]*\n([A-Z][A-Za-z .]+)",

        r"With Regards[,:\s]*\n([A-Z][A-Za-z .]+)",

        r"Best regards[,:\s]*\n([A-Z][A-Za-z .]+)",

        r"Regards[,:\s]*\n([A-Z][A-Za-z .]+)"

            ]

            for pat in broker_patterns:

                m = re.search(
            pat,
            text,
            re.I
                )

                if m:

                    broker = m.group(1).strip()

                    if len(broker) < 50:

                        entities["BROKER"] = broker

                        changed = True

                        break



        # --------------------------------
         # CARGO
        # --------------------------------

        if not entities.get("CARGO"):

            cargo_patterns = [

        r"CARGO\s*[:\-]\s*([A-Z0-9 \/\-]+)",
        r"COMMODITY\s*[:\-]\s*([A-Z0-9 \/\-]+)",
        r"MATERIAL\s*[:\-]\s*([A-Z0-9 \/\-]+)"

            ]

            found = False

            for pat in cargo_patterns:

                m = re.search(
            pat,
            text,
            re.I
                )

                if m:

                    entities["CARGO"] = (
                m.group(1)
                .split("\n")[0]
                .strip()
                    )

                    changed = True
                    found = True
                    break

            if not found:

                cargoes = [

            "IRON ORE",
            "COAL",
            "BAUXITE",
            "UREA",
            "CLINKER",
            "CEMENT",
            "WHEAT",
            "GRAIN",
            "SUGAR",
            "FERTILIZER",
            "GYPSUM",
            "TSP",
            "HBI",
            "DRI",
            "ALUMINA",
            "PETCOKE",
            "STEEL",
            "COILS",
            "LOGS",
            "CASHEW"

                ]

                upper = text.upper()

                for cargo in cargoes:

                    if cargo in upper:

                        entities["CARGO"] = cargo

                        changed = True

                        break
        # --------------------------------
        # CARGO TYPE
        # --------------------------------

        if not entities.get("CARGO_TYPE"):

            cargo_type_map = {

        "COAL": "Dry Bulk",
        "IRON ORE": "Dry Bulk",
        "BAUXITE": "Dry Bulk",
        "UREA": "Dry Bulk",
        "CLINKER": "Dry Bulk",
        "CEMENT": "Dry Bulk",
        "WHEAT": "Dry Bulk",
        "GRAIN": "Dry Bulk",
        "GYPSUM": "Dry Bulk",
        "TSP": "Dry Bulk",
        "HBI": "Dry Bulk",
        "DRI": "Dry Bulk",
        "ALUMINA": "Dry Bulk",
        "PETCOKE": "Dry Bulk",

        "STEEL": "General Cargo",
        "COILS": "General Cargo",
        "LOGS": "General Cargo",
        "CASHEW": "General Cargo",

        "PROJECT": "Project Cargo"
            }

            cargo = entities.get(
        "CARGO",
        ""
            ).upper()

            for k, v in cargo_type_map.items():

                if k in cargo:

                    entities["CARGO_TYPE"] = v

                    changed = True

                    break    
        if not entities.get("TONNAGE_TYPE"):

            upper = text.upper()

            if "BULK CARRIER" in upper:

                entities["TONNAGE_TYPE"] = "Bulk Carrier"

            elif "MPP" in upper:

                entities["TONNAGE_TYPE"] = "MPP"

            elif "HEAVY-LIFT" in upper:

                entities["TONNAGE_TYPE"] = "Heavy Lift"

            elif "GENERAL CARGO" in upper:

                 entities["TONNAGE_TYPE"] = "General Cargo"

            elif "CONTAINER" in upper:

                entities["TONNAGE_TYPE"] = "Container"

            elif "TANKER" in upper:

                entities["TONNAGE_TYPE"] = "Tanker"

            changed = True 
         
         # --------------------------------
# EMAIL TYPE
# --------------------------------

        if not entities.get("EMAIL_TYPE"):

            subject = ""

            m = re.search(
        r"Subject:\s*(.*)",
        text,
        re.I
            )

            if m:

                subject = (
            m.group(1)
            .upper()
                )

            upper = text.upper()

            if "OPEN" in subject:

                entities["EMAIL_TYPE"] = "TONNAGE"

            elif "CARGO" in subject:

                entities["EMAIL_TYPE"] = "VC"

            elif "TCT" in upper:

                entities["EMAIL_TYPE"] = "TC"

            else:

                 entities["EMAIL_TYPE"] = "UNKNOWN"

            changed = True
        # --------------------------------
         
         # --------------------------------
# MIN SIZE MAX SIZE
# --------------------------------

        if not entities.get("MIN_SIZE"):

            sizes = re.findall(
        r"(\d{1,3}[,]?\d{3})",
        text
            )

            sizes = [

                int(
            s.replace(",", "")
                )

                for s in sizes

                if int(
            s.replace(",", "")
                ) > 1000
            ]

            if sizes:

                entities["MIN_SIZE"] = str(
            min(sizes)
                )

                entities["MAX_SIZE"] = str(
                    max(sizes)
                )

                changed = True

        # --------------------------------
        # LAYCAN START END
        # --------------------------------

        if not entities.get("LAYCAN_START"):

            m = re.search(
                r"LAYCAN\s*[:\-]?\s*(\d{1,2})\s*[-/]\s*(\d{1,2})",
                text,
                re.I
            )

            if m:

                entities["LAYCAN_START"] = m.group(1)

                entities["LAYCAN_END"] = m.group(2)

                changed = True


        # --------------------------------
        # DURATION
        # --------------------------------

        if not entities.get("DURATION"):

            m = re.search(
                r"(\d+)\s*DAYS",
                text,
                re.I
            )

            if m:

                entities["DURATION"] = m.group(1)

                changed = True

            else:

                m = re.search(
            r"DURATION\s*[:\-]?\s*(\d+)",
            text,
            re.I
                )

                if m:

                    entities["DURATION"] = m.group(1)

                    changed = True    


        # --------------------------------
        # DEL PORT
        # --------------------------------

        if not entities.get("DEL_PORT"):

            patterns = [

        r"DELY\s+([A-Z][A-Z\s]+)",

        r"DELIVERY\s*[:\-]?\s*(.+)",

        r"DEL PORT\s*[:\-]?\s*(.+)"

            ]

            for pat in patterns:

                m = re.search(
            pat,
            text,
            re.I
                )

                if m:

                    entities["DEL_PORT"] = (
                         m.group(1)
                        .split("\n")[0]
                        .strip()
                    )

                    changed = True

                    break  

        # --------------------------------
        # REDEL PORT
        # --------------------------------

        if not entities.get("REDEL_PORT"):

            patterns = [

                r"REDEL\s+([A-Z][A-Z\s]+)",

                r"REDELIVERY\s*[:\-]?\s*(.+)",

                r"REDEL PORT\s*[:\-]?\s*(.+)"

            ]

            for pat in patterns:

                m = re.search(
                    pat,
                    text,
                    re.I
                )

                if m:

                    entities["REDEL_PORT"] = (
                        m.group(1)
                        .split("\n")[0]
                        .strip()
                    )

                    changed = True

                    break

        # --------------------------------
        # REGION
        # --------------------------------

        if not entities.get("REGION"):

            regions = [

                "PERSIAN GULF",
                "FAR EAST",
                "SOUTH EAST ASIA",
                "CHINA",
                "JAPAN",
                "WEST AFRICA",
                "BLACK SEA",
                "MEDITERRANEAN",
                "ECI",
                "WCI"

            ]

            upper = text.upper()

            for region in regions:

                if region in upper:

                    entities["REGION"] = region

                    changed = True

                    break 

        # --------------------------------
        # MATCHING REGION
        # --------------------------------

        if not entities.get("MATCHING_REGION"):

            patterns = [

        r"PG[\-/ ]JAPAN RANGE",

        r"CHINA JAPAN RANGE",

        r"PERSIAN GULF[\-/ ]JAPAN RANGE",

        r"FAR EAST",

        r"SOUTH EAST ASIA"

            ]

            upper = text.upper()

            for p in patterns:

                if p in upper:

                    entities["MATCHING_REGION"] = p

                    changed = True

                    break                                   
                

        if changed:

            updated += 1

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

    except Exception:
        pass

print()
print("UPDATED:", updated)