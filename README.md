# Maritime Mail Extractor

Lightweight standalone Node.js API for extracting structured maritime chartering data from raw broker emails.

The project uses a rule-based maritime extraction engine designed for:

* TC / VC / Tonnage classification
* Laycan extraction
* Cargo extraction
* Commission extraction
* Route parsing
* Region mapping
* Vessel requirement parsing
* Multiline broker email segmentation

The extractor processes complex maritime broker emails and returns structured enterprise JSON output.

---

# Features

* Standalone lightweight API
* No frontend
* No PostgreSQL
* No environment variables
* No authentication required
* Handles long and multiline broker emails
* Supports TC / VC / Tonnage style messages
* JSON-based extraction API
* Fast rule-based extraction engine

---

# Project Structure

```text id="l2m1kq"
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

```bash id="r6d0ac"
npm install
```

---

# Run the Project

Start the API server:

```bash id="l3f8gk"
npm start
```

The API runs on:

```text id="e2k9tz"
http://localhost:3000
```

---

# Health Check

Open in browser:

```text id="v7o4qa"
http://localhost:3000/health
```

Expected response:

```json id="i4p2dy"
{
  "status": "ok"
}
```

---

# API Endpoint

## POST `/extract`

Extract structured maritime data from raw broker emails.

### Request Body

```json id="z5j8cw"
{
  "emailBody": "raw maritime broker email"
}
```

---

# PowerShell Testing (Recommended)

## Step 1 — Create Request Body

```powershell id="k9n1fw"
$body = @{
  emailBody = [string](Get-Content .\src\sample-email.txt -Raw)
} | ConvertTo-Json -Depth 10
```

## Step 2 — Send Request

```powershell id="f1s4mr"
$response = Invoke-RestMethod `
-Uri http://localhost:3000/extract `
-Method Post `
-ContentType "application/json" `
-Body $body
```

## Step 3 — Print JSON Output

```powershell id="u8d6yx"
$response | ConvertTo-Json -Depth 20
```

---

# Example JSON Response

```json id="o3v7nb"
[
  {
    "email_type": "TC",
    "dwt": "58000",
    "cargo": "Bulk Harmless Cargo",
    "commission": "3.75%",
    "matching_region": "West Africa",
    "confidence_score": 0.98
  }
]
```

---

# Development

Build TypeScript:

```bash id="q2a5ph"
npm run build
```

Run development mode:

```bash id="n6x8lu"
npm run dev
```

---

# Extraction Capabilities

The extraction engine supports:

* Maritime broker emails
* TC / VC charter formats
* DWT extraction
* Laycan parsing
* Cargo parsing
* Commission extraction
* Regional abbreviations
* Route extraction
* Restrictions parsing
* Multiline chartering emails
* Segmented broker circulars

---

# Notes

* The project is intentionally lightweight and standalone.
* No database or frontend setup is required.
* The extraction engine is rule-based and optimized for maritime chartering workflows.
* Accuracy depends on broker email formatting and supported maritime patterns.
* Designed for simple local setup and API-based integration.

---
