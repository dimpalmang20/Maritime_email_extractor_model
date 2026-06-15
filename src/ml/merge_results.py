# Location: src/ml/merge_results.py

def merge(regex_json, ml_json):

    # If regex output is a list (your current case)
    if isinstance(regex_json, list):

        merged_results = []

        for item in regex_json:

            result = item.copy()

            mapping = {
                "CARGO": ["cargo_name", "cargo"],
                "LOAD_PORT": ["load_port", "open_port", "port"],
                "DISCHARGE_PORT": ["discharge_port"],
                "LAYCAN": [
                    "laycan",
                    "open_date",
                    "laycan_start_date"
                ],
                "ETA": ["eta", "open_date"],
                "VESSEL": [
                    "vessel_name",
                    "tonnage_name"
                ],
                "VESSEL_TYPE": [
                    "vessel_type",
                    "tonnage_type"
                ],
                "DWT": ["dwt"],
                "CONTACT": [
                    "contact",
                    "pic",
                    "phone_number",
                    "email_id"
                ],
                "CHARTERER":["account_name"]
            }

            for ml_key, target_keys in mapping.items():

                if ml_key not in ml_json:
                    continue

                ml_value = ml_json[ml_key]

                for field in target_keys:

                    if (
                        field not in result
                        or result[field] in [
                            None,
                            "",
                            [],
                            "null"
                        ]
                    ):
                        result[field] = ml_value

            merged_results.append(result)

        return merged_results

    # Fallback if regex_json is dict
    result = regex_json.copy()

    return result