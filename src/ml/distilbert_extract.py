from transformers import pipeline

MODEL_PATH = "models/distilbert-maritime-ner"

ner = pipeline(
    "token-classification",
    model=MODEL_PATH,
    tokenizer=MODEL_PATH,
    aggregation_strategy="simple"
)

def extract_entities(text):

    results = ner(text)

    
    

    output = {}

    for r in results:
        score = r["score"]

        if score < 0.15:
            continue
        label = r["entity_group"]

        value = r["word"]

        if label not in output:
            output[label] = value

    return output


if __name__ == "__main__":

    sample = """
    60000 MT GRAIN IN BULK
    RUSSA B SEA / MED SEA
    20-25 JULY 2025
    """

    print(
        extract_entities(sample)
    )