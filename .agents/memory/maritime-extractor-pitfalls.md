---
name: Maritime extractor pitfalls
description: Non-obvious bugs and decisions made while pushing extraction accuracy from 81% to 100%
---

## Cargo blacklist person-name pattern

**Rule:** Do NOT put a generic "two-word Title-Case" pattern in `CARGO_BLACKLIST_PATTERNS`.

**Why:** Normalized cargo names (returned from `CARGO_ALIASES`) are Title-Case — "Steam Coal", "Petroleum Coke", "Iron Ore", "Bulk Harmless". A pattern like `/^[A-Z][a-z]+ [A-Z][a-z]+$/` will blacklist ALL of them, producing empty cargo fields even when extraction succeeds.

**How to apply:** Only use very specific patterns (company names, phone keywords, ship-part words) in the blacklist.

---

## `startsNewBlock` must exclude field-label "VESSEL" lines

**Rule:** `startsNewBlock` in `splitByBullets` must NOT trigger on "VESSEL TYPE:" or "VESSEL POSITION:" — only on entry-header "VESSEL:" / "VESSEL NAME:" etc.

**Why:** "VESSEL TYPE: BULK CARRIER (GEARED)" appears mid-description as a field. If it triggers a new block, the preceding vessel details (NAME, IMO, DWT, BUILT, FLAG) end up in Block 1 and the technical specs (GRT, LOA, GRAIN CAPACITY) plus OPEN/DATE end up in Block 2. Block 2 has no vessel name → low confidence → discarded. All those fields show empty in output.

**How to apply:** Use `^VESSEL\s*(?:NAME|DETAILS|OFFER|DESCRIPTION)?\s*:` instead of `^(?:VESSEL|TONNAGE)[:\s]`.

---

## DWT label-prefix pattern

**Rule:** parseDwt must handle "DWT: 52,000 - 58,000" (DWT as label prefix with colon, value follows) separately from "52,000 - 58,000 DWT" (value followed by keyword).

**Why:** TC circulars from some brokers write "DWT: min - max" without the keyword after the numbers.

**How to apply:** Add a `labelPrefixRange` pattern BEFORE the standard rangeMatch in parseDwt.

---

## Built year dual capture group

**Rule:** PATTERNS.builtYear uses two groups: group 1 for "BUILT: 2012" format, group 2 for "2015 BLT" format. Always use `builtMatch[1] ?? builtMatch[2]`.

**Why:** Regex alternation puts the year in different groups depending on which branch matched. Only reading group 1 silently misses the "2015 BLT" shorthand used in many broker circulars.

---

## Cargo extraction requires explicit colon

**Rule:** Cargo label patterns (`CARGO:`, `COMMODITY:`) must require a colon — not just whitespace. Pattern should be `(?:CARGO|COMMODITY)\s*:\s*` not `(?:CARGO|COMMODITY)[:\s]+`.

**Why:** Without requiring a colon, "CARGO INQUIRY" or "CARGO POSITION" in email subjects match as cargo names, producing garbage extractions.

---

## OPEN/DATE split format

**Rule:** Some tonnage circulars split the open location and date onto two labeled lines: `OPEN: PORT\nDATE: 18TH JULY 2025`. The open port extractor must handle this pattern alongside `OPEN PORT DATE` inline format.

**How to apply:** Add `segment.match(/OPEN\s*:\s*([^\n]+)\nDATE\s*:\s*([^\n]+)/i)` as the first (highest priority) openMatch option in `extractTonnageEntry`.

---

## VC signal must handle comma-formatted tonnage

**Rule:** `hasVCSignals` must include `/\b\d{1,3}[,]\d{3}\s*MT\b/` to catch "55,000 MT", "70,000 MT" etc.

**Why:** Many VC circulars write quantities with comma thousands-separators. The original signal only matched plain 5-digit numbers like `55000`.
