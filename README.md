# Maritime Email Extractor

A Hybrid Maritime Email Information Extraction System that combines:

* Rule-Based Regex Extraction
* DistilBERT Maritime NER Model
* Hybrid Merge Engine
* Confidence-Based Future LLM Fallback

The system extracts structured maritime chartering information from unstructured broker emails.

---

# Project Overview

Maritime brokers exchange thousands of emails daily containing:

* Vessel positions
* Cargo requirements
* Chartering requests
* Freight rates
* Laycans
* Ports
* Vessel specifications

These emails are highly unstructured and difficult to process automatically.

This project converts raw maritime emails into structured JSON records using a Hybrid AI Pipeline.

---

# Features

### Regex Engine

Extracts:

* Vessel details
* Cargo details
* Ports
* Laycan dates
* Freight rates
* Charterer information

using handcrafted maritime business rules.

---

### DistilBERT Maritime NER

Custom-trained Named Entity Recognition model for:

* VESSEL
* VESSEL_TYPE
* DWT
* PORT
* LOAD_PORT
* DISCHARGE_PORT
* CONTACT
* BROKER
* CHARTERER
* CARGO
* QUANTITY
* IMO
* ETA
* LAYCAN
* FREIGHT_RATE
* TONNAGE
* RESTRICTIONS

---

### Hybrid Merge Layer

Combines:

Regex Results

*

ML Results

into a final enterprise output.

---

### Confidence Engine

Generates:

```json
{
  "CONFIDENCE": 0.75,
  "LLM_REQUIRED": false
}
```

Future versions will automatically trigger an LLM when confidence becomes low.

---

# Architecture

Raw Maritime Email

↓

Regex Engine

↓

DistilBERT NER

↓

Merge Engine

↓

Confidence Engine

↓

Enterprise JSON Output

---

# Folder Structure

```text
MaritimeEmailExtractorModel/

├── datasets/
│   ├── gold_labels/
│   ├── ner_train.jsonl
│   ├── ner_train_clean.jsonl
│
├── models/
│   └── distilbert-maritime-ner/
│
├── scripts/
│   ├── create_ner_dataset.py
│   ├── count_labels.py
│   ├── count_labels_final.py
│   ├── normalize_labels.py
│   ├── find_bad_labels.py
│   ├── test_ml_only.py
│   └── evaluate_model.py
│
├── src/
│   ├── ml/
│   │   ├── predict.py
│   │   ├── train_distilbert_ner.py
│   │   ├── distilbert_extract.py
│   │   └── merge_results.py
│   │
│   ├── server.ts
│   └── maritime-extractor.ts
│
├── tests/
│   ├── email1.txt
│   ├── email2.txt
│   ├── email3.txt
│   └── email4.txt
│
├── package.json
├── tsconfig.json
└── README.md
```

---

# Dataset Information

Dataset Size:

```text
1386 Maritime Emails
```

Entities:

```text
BROKER               271
CARGO               1545
CHARTERER            282
CHARTER_TYPE         281
CONTACT             1938
DISCHARGE_PORT       384
DWT                 1352
ETA                 1069
ETD                    3
FREIGHT_RATE          50
IMO                  189
LAYCAN               705
LOAD_PORT            503
PORT                2068
QUANTITY             206
RESTRICTIONS         151
TONNAGE              226
VESSEL              1889
VESSEL_TYPE          742
```

Training data is stored in:

```text
datasets/ner_train_clean.jsonl
```

---

# Create Dataset

Generate NER training dataset:

```bash
python create_ner_dataset.py
```

Output:

```text
datasets/ner_train.jsonl
```

---

# Normalize Labels

Convert inconsistent labels into unified labels:

```bash
python scripts/normalize_labels.py
```

Output:

```text
datasets/ner_train_clean.jsonl
```

---

# Check Entity Distribution

```bash
python scripts/count_labels_final.py
```

---

# Train DistilBERT Maritime NER

Run:

```bash
python src/ml/train_distilbert_ner.py
```

Output model:

```text
models/distilbert-maritime-ner/
```

Contains:

```text
config.json
tokenizer.json
tokenizer_config.json
special_tokens_map.json
model.safetensors
```

---

# Test ML Model Only

Email 1

```bash
python scripts/test_ml_only.py tests/email1.txt
```

Email 2

```bash
python scripts/test_ml_only.py tests/email2.txt
```

Email 3

```bash
python scripts/test_ml_only.py tests/email3.txt
```

Email 4

```bash
python scripts/test_ml_only.py tests/email4.txt
```

---

# Run Full API

Start server:

```bash
npm start
```

Expected:

```text
Maritime extractor API running on http://localhost:3000
```

---

# Test Full Hybrid Pipeline

PowerShell:

```powershell
$email = Get-Content .\tests\email2.txt -Raw

$body = @{
 emailBody = $email
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
-Uri http://localhost:3000/extract `
-Method Post `
-ContentType "application/json" `
-Body $body | ConvertTo-Json -Depth 50
```

Repeat for email2, email3, email4.

---

# Sample Output

```json
{
  "email_type": "Cargo Tc",
  "cargo_name": "Bulk Harmless Cargo",
  "account_name": "YB Global Shipping LLC FZ",
  "min_size": "58000",
  "max_size": "65000",
  "laycan_start_date": "2025-07-26",
  "laycan_end_date": "2025-07-31"
}
```

---

# Hybrid Pipeline Logic

Regex extracts:

```json
{
  "cargo_name": "Bulk Harmless Cargo"
}
```

ML extracts:

```json
{
  "CARGO": "bulk harmless cargo"
}
```

Merge Layer combines both and fills missing fields.

Priority:

```text
Regex
↓
ML
↓
Future LLM
```

---

# Confidence Logic

Current:

```json
{
  "CONFIDENCE": 0.75,
  "LLM_REQUIRED": false
}
```

Rules:

```text
>=10 entities → 0.90

>=7 entities → 0.75

>=5 entities → 0.60

<5 entities → 0.30
```

---

# Future Improvements

* LLM Fallback for low confidence predictions
* Active Learning Pipeline
* Human-in-the-loop annotation
* Automatic Dataset Expansion
* Maritime Knowledge Graph
* Vessel Database Integration
* Cargo Market Analytics

---

# Technology Stack

Backend

* Node.js
* TypeScript

Machine Learning

* Python
* PyTorch
* Hugging Face Transformers
* DistilBERT

Data Processing

* JSON
* Regex
* Custom Maritime Rules

---

# Author

Dimpal

Electronics & Telecommunication Engineering

SSVPS College of Engineering

Maritime AI & Information Extraction Research

---

# License

MIT License
