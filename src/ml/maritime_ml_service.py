import json

from distilbert_extract import extract_entities


def fill_missing_fields(
    regex_result,
    email_text
):

    ml_result = extract_entities(
        email_text
    )

    mapping = {
        "CARGO": "cargo",
        "LOAD_PORT": "load_port",
        "DISCHARGE_PORT": "discharge_port",
        "LAYCAN": "laycan",
        "QUANTITY": "quantity",
        "VESSEL": "vessel_name",
        "DWT": "dwt"
    }

    final_result = regex_result.copy()

    for ml_key, json_key in mapping.items():

        if (
            json_key not in final_result
            or final_result[json_key] in [None, "", []]
        ):

            if ml_key in ml_result:

                final_result[json_key] = ml_result[ml_key]

    return final_result