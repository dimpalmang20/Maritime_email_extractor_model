# Maritime Mail Extractor

Lightweight standalone Node.js API for extracting structured maritime chartering data from raw broker emails.

The project uses an enterprise-style rule-based maritime extraction engine optimized for real-world broker circulars, TC/VC cargo emails, and tonnage requirements.

---

# Features

* Standalone lightweight API
* No frontend
* No PostgreSQL
* No environment variables
* No authentication required
* Handles multiline broker circular emails
* Supports TC / VC / Tonnage classification
* Dynamic JSON extraction response
* Multi-block segmentation support
* Maritime abbreviation normalization
* Laycan parsing
* Cargo extraction
* Commission extraction
* Route parsing
* Vessel requirement parsing
* Confidence scoring
* Fast rule-based extraction engine

---

# Project Structure

```text
src/
  maritime-extractor.ts
  server.ts
  sample-email.txt

package.json
package-lock.json
tsconfig.json
README.md
sample-output.json
.gitignore
```

---

# Installation

Install dependencies:

```bash
npm install
```

---

# Run the Project

Start the API server:

```bash
npm start
```

The API runs on:

```text
http://localhost:3000
```

---

# Health Check

Open in browser:

```text
http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

---

# API Endpoint

## POST `/extract`

Extract structured maritime data from raw broker emails.

---

# Request Body

```json
{
  "emailBody": "raw maritime broker email"
}
```

---

# PowerShell Testing (Recommended)

## Step 1 — Create Request Body

```powershell
$body = @{
  emailBody = [string](Get-Content .\src\sample-email.txt -Raw)
} | ConvertTo-Json -Depth 10
```

## Step 2 — Send Request

```powershell
$response = Invoke-RestMethod `
-Uri http://localhost:3000/extract `
-Method Post `
-ContentType "application/json" `
-Body $body
```

## Step 3 — Print JSON Output

```powershell
$response | ConvertTo-Json -Depth 20
```

---

# Example JSON Response

```json
[
  {
    "email_type": "VC",
    "cargo": "Urea",
    "quantity": "30000",
    "quantity_unit": "MT",
    "load_port": "Bandar Imam Khomeini, Iran",
    "discharge_port": "Durban, South Africa",
    "laycan_start": "2026-07-16",
    "laycan_end": "2026-07-20",
    "commission": "1.25%",
    "confidence_score": 0.98
  }
]
```

---

# Development

Build TypeScript:

```bash
npm run build
```

Run development mode:

```bash
npm run dev
```

---

# Extraction Capabilities

The extraction engine supports:

* Maritime broker circular emails
* TC / VC charter formats
* Tonnage requirements
* DWT extraction
* Laycan parsing
* Cargo extraction
* Commission extraction
* Maritime route parsing
* Regional abbreviation normalization
* Multi-order broker emails
* Segmented cargo blocks
* Vessel requirement parsing
* Restrictions parsing
* Compact broker shorthand formats

---

# Notes

* The project is intentionally lightweight and standalone.
* No database or frontend setup is required.
* The extraction engine is fully rule-based.
* Optimized for maritime chartering workflows.
* Designed for local API integration and broker email processing.
* Accuracy depends on broker email formatting and supported maritime patterns.

---
