import os
import json

DATASETS = [

    (
        "datasets/gold_raw",
        "datasets/gold_labels"
    ),

    (
        "datasets/historical_converted/raw",
        "datasets/historical_converted/labels"
    )

]

OUTPUT_FILE = "datasets/ner_train_final.jsonl"


def find_entity(text, value):

    if value is None:
        return None

    if isinstance(value, list):
        return None

    value = str(value).strip()

    if not value:
        return None

    if not value:
        return None

    start = text.lower().find(value.lower())

    if start == -1:
        return None

    end = start + len(value)

    return [start, end]



seen_texts = set()

with open(OUTPUT_FILE, "w", encoding="utf8") as out:

    total = 0

    for RAW_DIR, LABEL_DIR in DATASETS:

        if not os.path.exists(RAW_DIR):
            continue

        if not os.path.exists(LABEL_DIR):
            continue

        print()
        print("Processing Dataset:")
        print(RAW_DIR)
        print(LABEL_DIR)
        print()

        for filename in os.listdir(RAW_DIR):

            if not filename.endswith(".txt"):
                continue

            raw_path = os.path.join(
                RAW_DIR,
                filename
            )

            json_file = filename.replace(
                ".txt",
                ".json"
            )

            json_path = os.path.join(
                LABEL_DIR,
                json_file
            )

            if not os.path.exists(json_path):
                continue

            with open(
                raw_path,
                "r",
                encoding="utf8",
                errors="ignore"
            ) as f:

                text = f.read()

            with open(
                json_path,
                "r",
                encoding="utf8"
            ) as f:

                label = json.load(f)

            print("Processing:", json_file)

            entities = []

            # FORMAT A
            if isinstance(label, dict) and "entities" in label:

                src = label["entities"]

                if isinstance(src, dict):

                    for ner_label, value in src.items():

                        if value is None:
                            continue

                        if isinstance(value, list):

                            for item in value:

                                result = find_entity(
                                    text,
                                    item
                                )

                                if result:

                                    entities.append([
                                        result[0],
                                        result[1],
                                        ner_label
                                    ])

                        else:

                            result = find_entity(
                                text,
                                value
                            )

                            if result:

                                entities.append([
                                    result[0],
                                    result[1],
                                    ner_label
                                ])

                elif isinstance(src, list):

                    for item in src:

                        if not isinstance(item, list):
                            continue

                        if len(item) != 2:
                            continue

                        value = item[0]
                        ner_label = item[1]

                        result = find_entity(
                            text,
                            value
                        )

                        if result:

                            entities.append([
                                result[0],
                                result[1],
                                ner_label
                            ])

            # FORMAT B
            elif isinstance(label, dict) and "vessel_name" in label:

                extracted = {
                    "VESSEL": label.get("vessel_name"),
                    "LOAD_PORT": label.get("open_port"),
                    "DWT": label.get("dwt"),
                    "VESSEL_TYPE": label.get("vessel_type"),
                    "BROKER": label.get("broker")
                }

                for ner_label, value in extracted.items():

                    result = find_entity(
                        text,
                        value
                    )

                    if result:

                        entities.append([
                            result[0],
                            result[1],
                            ner_label
                        ])

            # FORMAT C
            elif isinstance(label, dict) and "vessels" in label:

                if len(label["vessels"]) > 0:

                    vessel = label["vessels"][0]

                    extracted = {
                        "VESSEL": vessel.get("name"),
                        "LOAD_PORT": vessel.get("open_position"),
                        "DWT": vessel.get("dwt")
                    }

                    for ner_label, value in extracted.items():

                        result = find_entity(
                            text,
                            value
                        )

                        if result:

                            entities.append([
                                result[0],
                                result[1],
                                ner_label
                            ])

            # LIST FORMAT
            elif isinstance(label, list):

                for item in label:

                    if not isinstance(item, dict):
                        continue

                    if "entities" not in item:
                        continue

                    src = item["entities"]

                    if isinstance(src, dict):

                        for ner_label, value in src.items():

                            result = find_entity(
                                text,
                                value
                            )

                            if result:

                                entities.append([
                                    result[0],
                                    result[1],
                                    ner_label
                                ])

            if len(entities) == 0:

                print(
                    "NO ENTITIES FOUND:",
                    json_file
                )

                continue

            if text in seen_texts:
                continue

            seen_texts.add(text)

            row = {
                "text": text,
                "entities": entities
            }

            out.write(
                json.dumps(
                    row,
                    ensure_ascii=False
                )
            )

            out.write("\n")

            total += 1

print()
print("NER dataset created")
print("Records:", total)
print("Output:", OUTPUT_FILE)