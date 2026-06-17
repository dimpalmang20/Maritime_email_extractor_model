# Quick Start Guide

## 1. Clone Repository

```bash
git clone https://github.com/dimpalmang20/Maritime_email_extractor_model.git

cd Maritime_email_extractor_model
```

---

## 2. Install Node.js Dependencies

```bash
npm install
```

---

## 3. Install Python Dependencies

```bash
pip install torch transformers datasets accelerate seqeval
```

Optional:

```bash
pip install pandas numpy scikit-learn
```

---

## 4. Verify Folder Structure

Ensure the trained model exists:

```text
models/
└── distilbert-maritime-ner/
    ├── config.json
    ├── model.safetensors
    ├── tokenizer.json
    ├── tokenizer_config.json
    └── special_tokens_map.json
```

---

## 5. Run Maritime API

```bash
npm start
```

Expected Output:

```text
Maritime extractor API running on http://localhost:3000
```

---

## 6. Verify DistilBERT Model

```bash
python verify.py
```

This loads the trained Maritime NER model and predicts entities from a sample maritime email.

---

## 7. Test ML Model Only

```bash
python scripts/test_ml_only.py tests/email1.txt

python scripts/test_ml_only.py tests/email2.txt

python scripts/test_ml_only.py tests/email3.txt

python scripts/test_ml_only.py tests/email4.txt
```

This bypasses regex and tests only DistilBERT predictions.

---

## 8. Test Complete Hybrid Pipeline

Open another PowerShell window:

```powershell
$email = Get-Content .\tests\email4.txt -Raw

$body = @{
 emailBody = $email
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
-Uri http://localhost:3000/extract `
-Method Post `
-ContentType "application/json" `
-Body $body | ConvertTo-Json -Depth 50
```

This executes:

Raw Email
↓
Regex Engine
↓
DistilBERT Model
↓
Merge Engine
↓
Final JSON Output

---

## 9. Generate Training Dataset

```bash
python scripts/create_ner_dataset.py
```

Output:

```text
datasets/ner_train.jsonl
```

---

## 10. Normalize Labels

```bash
python scripts/normalize_labels.py
```

Output:

```text
datasets/ner_train_clean.jsonl
```

---

## 11. Check Dataset Statistics

```bash
python scripts/count_labels_final.py
```

Displays entity counts for all maritime labels.

---

## 12. Train DistilBERT Maritime NER

```bash
python src/ml/train_distilbert_ner.py
```

Output:

```text
models/distilbert-maritime-ner/
```

Training Dataset:

```text
datasets/ner_train_clean.jsonl
```

Current Dataset Size:

```text
1386 Maritime Emails
```

---

## 13. Training on Google Colab (Recommended)

For faster training:

1. Open Google Colab
2. Enable GPU Runtime (T4)
3. Upload:

```text
datasets/ner_train_clean.jsonl

src/ml/train_distilbert_ner.py
```

4. Install dependencies:

```bash
!pip install torch transformers datasets accelerate seqeval
```

5. Run:

```bash
!python train_distilbert_ner.py
```

6. Download:

```text
distilbert-maritime-ner/
```

7. Replace:

```text
models/distilbert-maritime-ner/
```

inside the project.

---

## 14. Git Workflow

After modifications:

```bash
git add .

git commit -m "Updated Maritime Extractor"

git push origin main
```

Check status:

```bash
git status
```

Expected:

```text
working tree clean
```

---

## 15. Expected Pipeline Flow

```text
Raw Maritime Email
        ↓
Regex Extraction
        ↓
DistilBERT Maritime NER
        ↓
Hybrid Merge Engine
        ↓
Confidence Engine
        ↓
Structured JSON Output
```
