import os
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

MODEL_PATH = "models/distilbert-maritime-ner"
TEST_EMAIL = "tests/email3.txt"

if not os.path.exists(MODEL_PATH):
    print(f"[-] Could not find weights at {MODEL_PATH}. Run training first!")
    exit()

print("[+] Loading trained weights...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForTokenClassification.from_pretrained(MODEL_PATH)

ner = pipeline(
    "token-classification",
    model=model,
    tokenizer=tokenizer,
    aggregation_strategy="simple"
)

if os.path.exists(TEST_EMAIL):
    with open(TEST_EMAIL, "r", encoding="utf8", errors="ignore") as f:
        sample_text = f.read()
    
    results = ner(sample_text)
    print("\n================ DETECTED SHIPPING ENTITIES ================")
    print(f"TOTAL DETECTED: {len(results)}")
    print("============================================================")
    for ent in results:
        print(f"Label: {ent['entity_group']:<15} | Snippet: {ent['word']:<25} | Confidence: {ent['score']:.2%}")
else:
    print(f"[-] Test target missing at: {TEST_EMAIL}")