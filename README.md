# Maritime-email-extractor
# Maritime Email Extraction Platform

## Overview

The Maritime Email Extraction Platform is an AI-assisted maritime intelligence system designed to extract structured shipping and chartering information from unstructured maritime broker emails.

The system processes complex maritime chartering emails and converts them into structured JSON records for analytics, search, and operational usage.

---

# Features

- Voyage Charter (VC) extraction
- Time Charter (TC) extraction
- Tonnage position extraction
- Cargo extraction
- Port extraction
- Laycan extraction
- DWT extraction
- Vessel type classification
- Commission extraction
- Confidence scoring
- Structured JSON generation
- Maritime analytics dashboard
- Bulk email parsing support

---

# Supported Maritime Data

The platform can extract:

- Cargo names
- Cargo quantities
- Load ports
- Discharge ports
- Delivery locations
- Redelivery locations
- Vessel type
- DWT ranges
- Laycan dates
- Commission percentages
- Open vessel positions
- Maritime chartering terms

---

# Run Backend & Frontend

## 1. Start PostgreSQL

Make sure PostgreSQL service is running and database exists.

Database name:

```env
projectdb
```

---

# 2. Create `.env` File

Create `.env` file in project root:

```txt
C:\Projects\Maritimemailextractor\.env
```

Add this inside `.env`:

```env
DATABASE_URL=postgresql://postgres:1234@localhost:5432/projectdb
PORT=5000
BASE_PATH=/
```

---

# Backend Setup

## 3. Install Dependencies

```bash
pnpm install
```

---

## 4. Push Database Schema

```bash
pnpm --filter @workspace/db run push
```

This command:

- Connects PostgreSQL
- Creates database tables
- Applies Drizzle schema changes

---

## 5. Run Backend Server

Open terminal:

```powershell
$env:DATABASE_URL="postgresql://postgres:1234@localhost:5432/projectdb"
```

```powershell
$env:PORT="5000"
```

Run backend:

```bash
pnpm --filter @workspace/api-server run dev
```

Backend runs on:

```txt
http://localhost:5000
```

---

# Frontend Setup

## 6. Open Second Terminal

Go to project root:

```bash
cd C:\Projects\Maritimemailextractor
```

---

## 7. Set Frontend Environment Variables

```powershell
$env:PORT="5173"
```

```powershell
$env:BASE_PATH="/"
```

---

## 8. Run Frontend

```bash
pnpm --filter @workspace/maritime-extractor run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

---

# Final Running Structure

| Service | Port |
|---|---|
| Backend API | 5000 |
| Frontend | 5173 |

---

# Important Notes

- Keep backend terminal running while using frontend.
- PostgreSQL must remain active.
- Run backend before frontend.
- If frontend fails, ensure `PORT` and `BASE_PATH` are set.
- If backend fails, ensure `DATABASE_URL` is correct.

---

# Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Drizzle ORM
- React
- Vite
- Tailwind CSS
- PNPM Workspaces

## Database
- PostgreSQL

---

# Project Structure

```bash
artifacts/
lib/
scripts/
package.json
pnpm-workspace.yaml
README.md
