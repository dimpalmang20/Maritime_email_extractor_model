# Location: src/ml/predict.py
import sys
import json
import os

# Suppress Hugging Face text walls
os.environ["TRANSFORMERS_VERBOSITY"] = "error"

from distilbert_extract import extract_entities
from merge_results import merge

def main():
    try:
        # 1. Read raw text sent from TypeScript
        email_text = sys.stdin.read()
        
        # 2. Get Machine Learning Predictions
        ml_predictions = extract_entities(email_text)
        with open("pure_ml_output.json", "w", encoding="utf8") as f:
            json.dump(
                ml_predictions,
                f,
                indent=2,
                ensure_ascii=False
            )
        # 3. Read what your Regex script saved earlier
        regex_output_path = "regex_output.json"
        if os.path.exists(regex_output_path):
            with open(regex_output_path, "r", encoding="utf8") as f:
                regex_predictions = json.load(f)
        else:
            regex_predictions = {}

        # 4. Perform the classic merge logic
        merged_final = merge(regex_predictions, ml_predictions)
        
        # 4.5 Confidence calculation

        entity_count = len(ml_predictions)

        if entity_count >= 10:
             confidence = 0.90

        elif entity_count >= 7:
             confidence = 0.75

        elif entity_count >= 5:
            confidence = 0.60

        else:
             confidence = 0.30

        llm_required = confidence < 0.50
        # 5. Create a combined debugging response
        diagnostic_response = {

            "DEBUG_INFO": {
                "message": "Pipeline completed successfully",
                "total_ml_entities_found": len(ml_predictions)
             },

            "CONFIDENCE": confidence,

            "LLM_REQUIRED": llm_required,

            "PURE_REGEX_OUTPUT": regex_predictions,

            "PURE_ML_OUTPUT": ml_predictions,

            "FINAL_COMBINED_HYBRID_OUTPUT": merged_final
            }

        # Send it all back to TypeScript stdout
        print(json.dumps(diagnostic_response))

    except Exception as e:
        # If anything breaks, send the error back inside a JSON format
        error_response = {
            "DEBUG_INFO": {
                "status": "ERROR",
                "error_msg": str(e)
            },
            "PURE_REGEX_OUTPUT": {},
            "PURE_ML_OUTPUT": {},
            "FINAL_COMBINED_HYBRID_OUTPUT": {}
        }
        print(json.dumps(error_response))

if __name__ == "__main__":
    main()