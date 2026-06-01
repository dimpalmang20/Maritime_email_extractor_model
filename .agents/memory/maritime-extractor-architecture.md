---
name: Maritime Extractor Architecture
description: Key function chain, new helpers added in improvement session, and durable design rules for the extraction engine
---

# Maritime Extractor Architecture

## Function call chain (high level)
```
extractToEnterpriseJSON(emailBody)
  └─ normalizeEmailText()          ← apostrophe thousands, smart quotes, whitespace
  └─ segmentEmail()                ← splits into VC / TC / Tonnage blocks
      └─ detectSegmentType()       ← VC/TC/Tonnage heuristics (signals counted)
  └─ extractVCEntry(segment)
      └─ extractCargoName()        ← explicit label → inline → compact shorthand
      └─ cleanCargoName()          ← strips noise, "+" → "/" for combined
      └─ normalizeCargo()          ← CARGO_ALIASES lookup
      └─ resolveMultiPort()        ← NEW: OR/& split + SPSB strip + resolvePort
      └─ parseLaycan()             ← date formats incl Q1/Q2/H1/H2 + SPOT/PROMPT
      └─ extractCommonTechnicalFields()
          └─ parseCompactRates()   ← NEW: fallback for 4000X/2000X broker shorthand
  └─ extractTCEntry(segment)
  └─ extractTonnageEntry(segment)
```

## Key new helpers (added in improvement session)

### `resolveMultiPort(raw: string | null): string | null`
Handles: `"ISKENDERUN OR DURBAN"` → `"Iskenderun, Turkey / Durban, South Africa"`, SPSB notation (`1 SPSB VIZAG` → `VIZAG`), and single ports.
**Why:** extractVCEntry previously used bare `isValidPort(raw) ? resolvePort(raw)` which couldn't handle multi-port discharge/load strings.
**How to apply:** Always use `resolveMultiPort` instead of `resolvePort` in extractVCEntry and any future port resolution.

### `parseCompactRates(text: string): { loadRate, dischargeRate }`
Pattern: `\b(\d{3,6})\s*(X|SHINC|SHEX|...)?\s*\/\s*(\d{3,6})\s*(X|...)?` — guards: 500–100,000 MT/DAY. Called as fallback at end of `extractCommonTechnicalFields`.
**Why:** Broker shorthand like `8000X/5000X` or `10000SHEX/6000SHINC` doesn't match the explicit `LOAD RATE:` patterns.
**How to apply:** Only fires when `fields.load_rate` or `fields.discharge_rate` is still unset after explicit patterns.

### `parseLaycan()` extensions
Added: `Q1/Q2/Q3/Q4 YYYY` → first/last day of quarter, `H1/H2 YYYY` → first/last day of half-year.
Pattern order: SPOT/PROMPT → quarter → half → range → single month → year-only.

## Durable design rules

1. **Cargo extraction order:** explicit label → label-on-next-line → inline bulk → compact shorthand (KNOWN_COMMODITIES). Never short-circuit to a later stage if an earlier stage fires.

2. **`cleanCargoName` must run before `normalizeCargo`.** cleanCargoName strips quantity prefixes (`15,000 MT`), noise words (UPRIVER, MTS, IN BULK), and combines with "/" before the alias lookup.

3. **`+` in cargo → `/`** before any other cleanup. Combined commodities like `SLAG + CLINKER` must become `SLAG/CLINKER` to survive the `isValidCargo` check (which rejects strings containing `+`).

4. **Port resolution chain:** resolveMultiPort → cleanBrokerLocation → isValidPort → resolvePort. Never skip cleanBrokerLocation — it strips LOADING/PORT/SPSB noise that breaks isValidPort lookups.

5. **Compact rates guard: 500–100,000 MT/DAY.** Without this, GRT/NRT numbers (e.g. `32,489 / 19,456`) would falsely match the rate pattern.

6. **CARGO_ALIASES key must be ALL_CAPS.** `normalizeCargo` does `raw.toUpperCase()` before lookup, so aliases must be keyed in uppercase (`"FERTS"` not `"Ferts"`).

7. **Test suite is the source of truth.** Never remove existing checks. Add new tests for every new feature. The suite now has 30 tests / 184 checks at 100% accuracy.

## File sizes (approximate, as of this session)
- `src/maritime-extractor.ts` — ~1830 lines
- `src/test-extraction.ts` — ~1070 lines (30 tests)
- `src/server.ts` — small HTTP wrapper, no business logic
