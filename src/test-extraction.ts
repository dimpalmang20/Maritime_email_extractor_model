// Maritime Extraction Test Suite — Easy to Complex
// Run: npx ts-node --esm src/test-extraction.ts

import { extractToEnterpriseJSON } from "./maritime-extractor.js";

interface TestCase {
  id: string;
  label: string;
  level: "EASY" | "MEDIUM" | "COMPLEX" | "EXPERT";
  emailBody: string;
  expectedCount: number;
  checks: Array<(results: ReturnType<typeof extractToEnterpriseJSON>) => { pass: boolean; msg: string }>;
}

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";

// ─── Test Cases ───────────────────────────────────────────────────────────────

const TESTS: TestCase[] = [

  // ═══════════════════════════════════════════════════════════════════════
  // EASY — Single clean emails
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: "E01",
    label: "Simple VC — Coal Vizag to Rotterdam",
    level: "EASY",
    emailBody: `
Dear Team,

We have the following cargo requirement:

CARGO: COAL
QUANTITY: 55,000 MT
LP: VIZAG, INDIA
DP: ROTTERDAM
LAYCAN: 15-20 JULY 2025
LOAD RATE: 15,000 MT/DAY
DISCH RATE: 12,000 MT/DAY
ADCOM: 3.75%

Please revert with offers.
    `.trim(),
    expectedCount: 1,
    checks: [
      (r) => ({ pass: r[0]?.email_type === "VC", msg: `email_type=VC got=${r[0]?.email_type}` }),
      (r) => ({ pass: !!r[0] && "cargo" in r[0] && (r[0] as any).cargo?.toLowerCase().includes("coal"), msg: `cargo has 'coal' got=${(r[0] as any)?.cargo}` }),
      (r) => ({ pass: !!r[0] && "quantity" in r[0] && (r[0] as any).quantity === "55000", msg: `quantity=55000 got=${(r[0] as any)?.quantity}` }),
      (r) => ({ pass: !!r[0] && "load_port" in r[0] && !!(r[0] as any).load_port, msg: `load_port set got=${(r[0] as any)?.load_port}` }),
      (r) => ({ pass: !!r[0] && "laycan_start" in r[0] && (r[0] as any).laycan_start === "2025-07-15", msg: `laycan_start=2025-07-15 got=${(r[0] as any)?.laycan_start}` }),
      (r) => ({ pass: !!r[0] && "load_rate" in r[0] && !!(r[0] as any).load_rate, msg: `load_rate set got=${(r[0] as any)?.load_rate}` }),
      (r) => ({ pass: !!r[0] && "commission" in r[0] && (r[0] as any).commission === "3.75%", msg: `commission=3.75% got=${(r[0] as any)?.commission}` }),
      (r) => ({ pass: r[0]?.confidence_score >= 0.70, msg: `confidence>=0.70 got=${r[0]?.confidence_score}` }),
    ],
  },

  {
    id: "E02",
    label: "Simple TC — Supramax bulk carrier",
    level: "EASY",
    emailBody: `
ACCT: PACIFIC GRAIN TRADERS
CARGO: GRAIN OR SOYA
DWT: 52,000 - 58,000
DEL: SINGAPORE
REDEL: WORLDWIDE
LAYCAN: 20-25 AUGUST 2025
DURATION: 6 MONTHS
ADCOM: 5%
    `.trim(),
    expectedCount: 1,
    checks: [
      (r) => ({ pass: r[0]?.email_type === "TC", msg: `email_type=TC got=${r[0]?.email_type}` }),
      (r) => ({ pass: !!r[0] && "account_name" in r[0] && !!(r[0] as any).account_name, msg: `account_name set got=${(r[0] as any)?.account_name}` }),
      (r) => ({ pass: !!r[0] && "dwt" in r[0] && !!(r[0] as any).dwt, msg: `dwt set got=${(r[0] as any)?.dwt}` }),
      (r) => ({ pass: !!r[0] && "laycan_start" in r[0] && (r[0] as any).laycan_start === "2025-08-20", msg: `laycan_start=2025-08-20 got=${(r[0] as any)?.laycan_start}` }),
      (r) => ({ pass: !!r[0] && "duration" in r[0] && !!(r[0] as any).duration, msg: `duration set got=${(r[0] as any)?.duration}` }),
      (r) => ({ pass: !!r[0] && "commission" in r[0] && (r[0] as any).commission === "5%", msg: `commission=5% got=${(r[0] as any)?.commission}` }),
      (r) => ({ pass: r[0]?.confidence_score >= 0.65, msg: `confidence>=0.65 got=${r[0]?.confidence_score}` }),
    ],
  },

  {
    id: "E03",
    label: "Simple Tonnage — MV with IMO and open port",
    level: "EASY",
    emailBody: `
MV OCEAN STAR
IMO NO: 9123456
DWT: 57,000
BUILT: 2010
FLAG: PANAMA
BULK CARRIER
OPEN SINGAPORE 15TH JULY 2025
    `.trim(),
    expectedCount: 1,
    checks: [
      (r) => ({ pass: r[0]?.email_type === "Tonnage", msg: `email_type=Tonnage got=${r[0]?.email_type}` }),
      (r) => ({ pass: !!r[0] && "vessel_name" in r[0] && (r[0] as any).vessel_name?.includes("OCEAN STAR"), msg: `vessel_name has 'OCEAN STAR' got=${(r[0] as any)?.vessel_name}` }),
      (r) => ({ pass: !!r[0] && "imo" in r[0] && (r[0] as any).imo === "9123456", msg: `imo=9123456 got=${(r[0] as any)?.imo}` }),
      (r) => ({ pass: !!r[0] && "dwt" in r[0] && (r[0] as any).dwt === "57000", msg: `dwt=57000 got=${(r[0] as any)?.dwt}` }),
      (r) => ({ pass: !!r[0] && "built_year" in r[0] && (r[0] as any).built_year === "2010", msg: `built_year=2010 got=${(r[0] as any)?.built_year}` }),
      (r) => ({ pass: !!r[0] && "open_date" in r[0] && !!(r[0] as any).open_date, msg: `open_date set got=${(r[0] as any)?.open_date}` }),
      (r) => ({ pass: r[0]?.confidence_score >= 0.75, msg: `confidence>=0.75 got=${r[0]?.confidence_score}` }),
    ],
  },

  {
    id: "E04",
    label: "TC with DELIVERY/REDELIVERY keywords",
    level: "EASY",
    emailBody: `
CHARTERER: ABC SHIPPING PTE LTD
CARGO: PETCOKE IN BULK
SIZE: ULTRAMAX / SUPRAMAX 55K-65K DWT
DELIVERY: APS PASSING SINGAPORE
REDELIVERY: WORLDWIDE
LAYCAN: END JULY 2025
DURATION: 4-6 MONTHS
COMMISSION: 3.75% TTL
    `.trim(),
    expectedCount: 1,
    checks: [
      (r) => ({ pass: r[0]?.email_type === "TC", msg: `email_type=TC got=${r[0]?.email_type}` }),
      (r) => ({ pass: !!r[0] && "cargo" in r[0] && ((r[0] as any).cargo?.toLowerCase().includes("petcoke") || (r[0] as any).cargo?.toLowerCase().includes("petroleum")), msg: `cargo has 'petcoke' got=${(r[0] as any)?.cargo}` }),
      (r) => ({ pass: !!r[0] && "laycan_start" in r[0] && !!(r[0] as any).laycan_start, msg: `laycan_start set (END JULY) got=${(r[0] as any)?.laycan_start}` }),
      (r) => ({ pass: !!r[0] && "duration" in r[0] && !!(r[0] as any).duration, msg: `duration set got=${(r[0] as any)?.duration}` }),
      (r) => ({ pass: r[0]?.confidence_score >= 0.60, msg: `confidence>=0.60 got=${r[0]?.confidence_score}` }),
    ],
  },

  {
    id: "E05",
    label: "VC — Iron Ore with SPOT laycan",
    level: "EASY",
    emailBody: `
Cargo Inquiry:

Cargo: Iron Ore Fines
Qty: 65,000 MT MOLOO
Loading Port: Paradip, India
Discharge Port: Qingdao, China
Laycan: SPOT
Load Rate: 20,000 MT/DAY
Disch Rate: 25,000 MT/DAY
Commission: 2.5%
    `.trim(),
    expectedCount: 1,
    checks: [
      (r) => ({ pass: r[0]?.email_type === "VC", msg: `email_type=VC got=${r[0]?.email_type}` }),
      (r) => ({ pass: !!r[0] && "cargo" in r[0] && !!(r[0] as any).cargo, msg: `cargo set got=${(r[0] as any)?.cargo}` }),
      (r) => ({ pass: !!r[0] && "quantity" in r[0] && (r[0] as any).quantity === "65000", msg: `quantity=65000 got=${(r[0] as any)?.quantity}` }),
      (r) => ({ pass: !!r[0] && "laycan_start" in r[0] && !!(r[0] as any).laycan_start, msg: `laycan_start set (SPOT) got=${(r[0] as any)?.laycan_start}` }),
      (r) => ({ pass: !!r[0] && "load_port" in r[0] && !!(r[0] as any).load_port, msg: `load_port set got=${(r[0] as any)?.load_port}` }),
      (r) => ({ pass: !!r[0] && "discharge_port" in r[0] && !!(r[0] as any).discharge_port, msg: `discharge_port set got=${(r[0] as any)?.discharge_port}` }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // MEDIUM — Real-world style, abbreviations, less structure
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: "M01",
    label: "Medium VC — broker circular abbreviations",
    level: "MEDIUM",
    emailBody: `
PLS NOTE:

1 SP KAKINADA / 1-2 SP VIZAG  55,000 MT COAL LAYCAN 16-21 OCT 2025
LR: 15,000 PDPR
DR: 12,000 PDPR
3.75% ADCOM

Best Regards,
John Smith
Oceanic Chartering Ltd
Mobile: +91 9876543210
    `.trim(),
    expectedCount: 1,
    checks: [
      (r) => ({ pass: r[0]?.email_type === "VC", msg: `email_type=VC got=${r[0]?.email_type}` }),
      (r) => ({ pass: !!r[0] && "cargo" in r[0] && (r[0] as any).cargo?.toLowerCase().includes("coal"), msg: `cargo has 'coal' got=${(r[0] as any)?.cargo}` }),
      (r) => ({ pass: !!r[0] && "quantity" in r[0] && (r[0] as any).quantity === "55000", msg: `quantity=55000 got=${(r[0] as any)?.quantity}` }),
      (r) => ({ pass: !!r[0] && "laycan_start" in r[0] && !!(r[0] as any).laycan_start, msg: `laycan_start set got=${(r[0] as any)?.laycan_start}` }),
      (r) => ({ pass: !!r[0] && "commission" in r[0] && (r[0] as any).commission === "3.75%", msg: `commission=3.75% got=${(r[0] as any)?.commission}` }),
      (r) => ({ pass: r[0]?.confidence_score >= 0.60, msg: `confidence>=0.60 got=${r[0]?.confidence_score}` }),
    ],
  },

  {
    id: "M02",
    label: "Medium TC — ACCT format with region ECI",
    level: "MEDIUM",
    emailBody: `
ACCT RELIANCE INDUSTRIES
CARGO: UREA IN BULK
55,000-65,000 DWT
DEL: 1 SP ECI
REDEL: 1 SP AG / ECI
LC 18TH - 22ND JULY 2025
DURATION: ABT 45 DAYS
3.75 ADCOM
    `.trim(),
    expectedCount: 1,
    checks: [
      (r) => ({ pass: r[0]?.email_type === "TC", msg: `email_type=TC got=${r[0]?.email_type}` }),
      (r) => ({ pass: !!r[0] && "account_name" in r[0] && (r[0] as any).account_name?.includes("RELIANCE"), msg: `account_name has 'RELIANCE' got=${(r[0] as any)?.account_name}` }),
      (r) => ({ pass: !!r[0] && "cargo" in r[0] && (r[0] as any).cargo?.toLowerCase().includes("urea"), msg: `cargo has 'urea' got=${(r[0] as any)?.cargo}` }),
      (r) => ({ pass: !!r[0] && "dwt" in r[0] && !!(r[0] as any).dwt, msg: `dwt set got=${(r[0] as any)?.dwt}` }),
      (r) => ({ pass: !!r[0] && "laycan_start" in r[0] && (r[0] as any).laycan_start === "2025-07-18", msg: `laycan_start=2025-07-18 got=${(r[0] as any)?.laycan_start}` }),
      (r) => ({ pass: !!r[0] && "matching_region" in r[0] && !!(r[0] as any).matching_region, msg: `matching_region set got=${(r[0] as any)?.matching_region}` }),
      (r) => ({ pass: r[0]?.confidence_score >= 0.65, msg: `confidence>=0.65 got=${r[0]?.confidence_score}` }),
    ],
  },

  {
    id: "M03",
    label: "Medium Tonnage — 63.5K vessel with shorthand DWT",
    level: "MEDIUM",
    emailBody: `
MV PEARL OCEAN (IMO 9234567)
63.5K DWT / 2015 BLT
FLAG: MARSHALL ISLANDS
BULK CARRIER
OPEN HALDIA 20 JULY 2025
GRAIN CAPACITY: 78,450 CBM
LOA: 199.9M
BEAM: 32.26M
GRT: 38,254 / NRT: 23,654
    `.trim(),
    expectedCount: 1,
    checks: [
      (r) => ({ pass: r[0]?.email_type === "Tonnage", msg: `email_type=Tonnage got=${r[0]?.email_type}` }),
      (r) => ({ pass: !!r[0] && "vessel_name" in r[0] && (r[0] as any).vessel_name?.includes("PEARL OCEAN"), msg: `vessel_name has 'PEARL OCEAN' got=${(r[0] as any)?.vessel_name}` }),
      (r) => ({ pass: !!r[0] && "dwt" in r[0] && (r[0] as any).dwt === "63500", msg: `dwt=63500 got=${(r[0] as any)?.dwt}` }),
      (r) => ({ pass: !!r[0] && "imo" in r[0] && (r[0] as any).imo === "9234567", msg: `imo=9234567 got=${(r[0] as any)?.imo}` }),
      (r) => ({ pass: !!r[0] && "built_year" in r[0] && (r[0] as any).built_year === "2015", msg: `built_year=2015 got=${(r[0] as any)?.built_year}` }),
      (r) => ({ pass: !!r[0] && "grt" in r[0] && !!(r[0] as any).grt, msg: `grt set got=${(r[0] as any)?.grt}` }),
      (r) => ({ pass: !!r[0] && "grain_capacity" in r[0] && !!(r[0] as any).grain_capacity, msg: `grain_capacity set got=${(r[0] as any)?.grain_capacity}` }),
      (r) => ({ pass: r[0]?.confidence_score >= 0.80, msg: `confidence>=0.80 got=${r[0]?.confidence_score}` }),
    ],
  },

  {
    id: "M04",
    label: "Medium VC — fertilizer with ECSA region",
    level: "MEDIUM",
    emailBody: `
Subject: DAP CARGO INQUIRY

Commodity: DAP Fertilizer
Quantity: 30,000 - 35,000 MT MOLOO
Load Port: 1 SP SANTOS, BRAZIL
Discharge Port: 2 SP KAKINADA / VIZAG
Laycan: EARLY AUGUST 2025
Loading Rate: 8,000 MT/DAY SHINC
Discharge Rate: 5,000 MT/DAY SHINC
Commission: 5% TTL (2.5% ADDCOM + 2.5%)
No HRA
    `.trim(),
    expectedCount: 1,
    checks: [
      (r) => ({ pass: r[0]?.email_type === "VC", msg: `email_type=VC got=${r[0]?.email_type}` }),
      (r) => ({ pass: !!r[0] && "cargo" in r[0] && (r[0] as any).cargo?.toLowerCase().includes("dap"), msg: `cargo has 'dap' got=${(r[0] as any)?.cargo}` }),
      (r) => ({ pass: !!r[0] && "quantity" in r[0] && (r[0] as any).quantity?.startsWith("30000"), msg: `quantity starts 30000 got=${(r[0] as any)?.quantity}` }),
      (r) => ({ pass: !!r[0] && "laycan_start" in r[0] && !!(r[0] as any).laycan_start, msg: `laycan_start set (EARLY AUG) got=${(r[0] as any)?.laycan_start}` }),
      (r) => ({ pass: !!r[0] && "restrictions" in r[0] && (r[0] as any).restrictions?.some((x: string) => /HRA/i.test(x)), msg: `restrictions has HRA got=${(r[0] as any)?.restrictions}` }),
      (r) => ({ pass: r[0]?.confidence_score >= 0.65, msg: `confidence>=0.65 got=${r[0]?.confidence_score}` }),
    ],
  },

  {
    id: "M05",
    label: "Medium TC — ONWARDS date + hire rate",
    level: "MEDIUM",
    emailBody: `
ACCOUNT: CARGILL GRAIN PTE LTD
CARGO: BULK HARMLESS CARGO
VESSEL SIZE: SUPRAMAX / ULTRAMAX 52-65K DWT
DELIVERY: SPORE / FAR EAST RANGE
REDELIVERY: WORLDWIDE EXCLUDING HRA
LAYCAN: 20 JULY 2025 ONWARDS
DURATION: 11-13 MONTHS
HIRE: USD 16,500/DAY
ADCOM: 3.75% TTL
    `.trim(),
    expectedCount: 1,
    checks: [
      (r) => ({ pass: r[0]?.email_type === "TC", msg: `email_type=TC got=${r[0]?.email_type}` }),
      (r) => ({ pass: !!r[0] && "account_name" in r[0] && (r[0] as any).account_name?.includes("CARGILL"), msg: `account_name has 'CARGILL' got=${(r[0] as any)?.account_name}` }),
      (r) => ({ pass: !!r[0] && "cargo" in r[0] && !!(r[0] as any).cargo, msg: `cargo set got=${(r[0] as any)?.cargo}` }),
      (r) => ({ pass: !!r[0] && "hire_rate" in r[0] && (r[0] as any).hire_rate?.includes("16500"), msg: `hire_rate has 16500 got=${(r[0] as any)?.hire_rate}` }),
      (r) => ({ pass: !!r[0] && "laycan_start" in r[0] && (r[0] as any).laycan_start === "2025-07-20", msg: `laycan_start=2025-07-20 ONWARDS got=${(r[0] as any)?.laycan_start}` }),
      (r) => ({ pass: !!r[0] && "duration" in r[0] && !!(r[0] as any).duration, msg: `duration set got=${(r[0] as any)?.duration}` }),
      (r) => ({ pass: r[0]?.confidence_score >= 0.70, msg: `confidence>=0.70 got=${r[0]?.confidence_score}` }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // COMPLEX — Multi-order, broker circulars, mixed types
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: "C01",
    label: "Complex — Multi-block TC circular (2 ACCT blocks)",
    level: "COMPLEX",
    emailBody: `
PLEASE TREAT IN STRICT CONFIDENCE

ACCT BUNGE AGRIBUSINESS
CARGO: SOYA BEANS IN BULK
SIZE: 52,000 - 58,000 DWT (SUPRAMAX)
DEL: 1 SP ECSA (BRAZIL RANGE)
REDEL: 1-2 SP FAR EAST
LC 15-20 AUGUST 2025
DURATION: ABT 60-75 DAYS
3.75 ADCOM

ACCT LOUIS DREYFUS
CARGO: GRAIN OR MAIZE IN BULK
SIZE: 60,000 - 65,000 DWT (ULTRAMAX)
DEL: 1 SP ECSA / WAFR
REDEL: 1-2 SP INDIA / PAKISTAN
LC 01-10 SEPTEMBER 2025
DURATION: ABT 55-70 DAYS
3.75 ADCOM
    `.trim(),
    expectedCount: 2,
    checks: [
      (r) => ({ pass: r.length === 2, msg: `2 entries extracted got=${r.length}` }),
      (r) => ({ pass: r.every(e => e.email_type === "TC"), msg: `both TC got types=${r.map(e => e.email_type)}` }),
      (r) => ({ pass: r.some(e => (e as any).account_name?.includes("BUNGE")), msg: `one entry has BUNGE` }),
      (r) => ({ pass: r.some(e => (e as any).account_name?.includes("DREYFUS") || (e as any).account_name?.includes("LOUIS")), msg: `one entry has LOUIS DREYFUS` }),
      (r) => ({ pass: r.some(e => (e as any).cargo?.toLowerCase().includes("soya") || (e as any).cargo?.toLowerCase().includes("bean")), msg: `one has soya/bean cargo` }),
      (r) => ({ pass: r.some(e => (e as any).cargo?.toLowerCase().includes("grain") || (e as any).cargo?.toLowerCase().includes("maize")), msg: `one has grain/maize cargo` }),
      (r) => ({ pass: r[0]?.confidence_score >= 0.60 && r[1]?.confidence_score >= 0.60, msg: `both confidence>=0.60` }),
    ],
  },

  {
    id: "C02",
    label: "Complex — Mixed VC and Tonnage in one email",
    level: "COMPLEX",
    emailBody: `
Dear Brokers,

CARGO REQUIREMENT:
-------------------
CARGO: STEAM COAL
QTY: 70,000 MT +/- 10%
LP: 2 SP NEWCASTLE, AUSTRALIA
DP: 2 SP TIANJIN, CHINA
LAYCAN: 10-15 SEPTEMBER 2025
LR: 18,000 MT/DAY SHEX
DR: 25,000 MT/DAY SHEX
COMMISSION: 2.5% ADCOM

-------------------
TONNAGE POSITION:
-------------------
MV GOLDEN BREEZE (IMO 9345678)
DWT: 82,500
BUILT: 2018 / FLAG: HONG KONG
BULK CARRIER
OPEN QINGDAO 05 SEPTEMBER 2025
GRT: 44,215 / NRT: 27,830
LOA: 229M / BEAM: 32.26M
    `.trim(),
    expectedCount: 2,
    checks: [
      (r) => ({ pass: r.length === 2, msg: `2 entries got=${r.length}` }),
      (r) => ({ pass: r.some(e => e.email_type === "VC"), msg: `one VC entry` }),
      (r) => ({ pass: r.some(e => e.email_type === "Tonnage"), msg: `one Tonnage entry` }),
      (r) => ({ pass: r.some(e => e.email_type === "VC" && (e as any).cargo?.toLowerCase().includes("coal")), msg: `VC has coal cargo` }),
      (r) => ({ pass: r.some(e => e.email_type === "Tonnage" && (e as any).vessel_name?.includes("GOLDEN BREEZE")), msg: `Tonnage has vessel name` }),
      (r) => ({ pass: r.some(e => e.email_type === "Tonnage" && (e as any).dwt === "82500"), msg: `Tonnage DWT=82500` }),
    ],
  },

  {
    id: "C03",
    label: "Complex — Noisy broker circular with signatures",
    level: "COMPLEX",
    emailBody: `
Subject: FW: CARGO POSITION - WAFR

From: marine@globalbrokers.com
Sent: Monday, June 02, 2025
To: chartering@shipping.com

---- Forwarded Message ----

CARGO POSITION - PLEASE CIRCULATE

CARGO: IRON ORE FINES
QUANTITY: 170,000 MT MOLOO 10% MOLCO
LP: 1 SP PARADIP, INDIA
DP: 2-3 SP WEST AFRICA (WAFR)
LAYCAN: 22ND JULY 2025
LOADING RATE: 35,000 MT/DAY PWWD SHINC
DISCHARGE RATE: 10,000 MT/DAY PWWD SHEX
3.75 ADDCOM

NO CHINESE CREW
NO IRANIAN ORIGIN CARGO

Best Regards,
Captain James Roberts
Global Maritime Brokers
Mobile: +44 7700 900123
    `.trim(),
    expectedCount: 1,
    checks: [
      (r) => ({ pass: r[0]?.email_type === "VC", msg: `email_type=VC got=${r[0]?.email_type}` }),
      (r) => ({ pass: !!r[0] && "cargo" in r[0] && (r[0] as any).cargo?.toLowerCase().includes("iron"), msg: `cargo has 'iron' got=${(r[0] as any)?.cargo}` }),
      (r) => ({ pass: !!r[0] && "quantity" in r[0] && (r[0] as any).quantity === "170000", msg: `quantity=170000 got=${(r[0] as any)?.quantity}` }),
      (r) => ({ pass: !!r[0] && "laycan_start" in r[0] && (r[0] as any).laycan_start === "2025-07-22", msg: `laycan_start=2025-07-22 got=${(r[0] as any)?.laycan_start}` }),
      (r) => ({ pass: !!r[0] && "load_rate" in r[0] && !!(r[0] as any).load_rate, msg: `load_rate set got=${(r[0] as any)?.load_rate}` }),
      (r) => ({ pass: !!r[0] && "restrictions" in r[0] && (r[0] as any).restrictions?.length >= 1, msg: `restrictions extracted got=${(r[0] as any)?.restrictions}` }),
    ],
  },

  {
    id: "C04",
    label: "Complex — 3-block VC circular with bullets",
    level: "COMPLEX",
    emailBody: `
PLEASE CIRCULATE — CARGO REQUIREMENTS:

1) CARGO: WHEAT
   QTY: 50,000 MT
   LP: ODESSA, BLACK SEA
   DP: CHITTAGONG, BANGLADESH
   LAYCAN: 01-10 AUGUST 2025
   L/R: 8,000 MT/DAY / D/R: 5,000 MT/DAY
   ADCOM: 3.75%

2) CARGO: PETCOKE
   QTY: 60,000 MT MOLOO
   LP: HOUSTON, USA
   DP: 2 SP VIZAG / KAKINADA, INDIA
   LAYCAN: MID AUGUST 2025
   LR: 12,000 MT/DAY / DR: 10,000 MT/DAY
   ADCOM: 3.75%

3) CARGO: FERTILIZER (DAP/MOP)
   QTY: 35,000 - 40,000 MT
   LP: AQABA, JORDAN
   DP: NHAVA SHEVA / MUNDRA, INDIA
   LAYCAN: 15-25 SEPTEMBER 2025
   ADCOM: 5%
    `.trim(),
    expectedCount: 3,
    checks: [
      (r) => ({ pass: r.length === 3, msg: `3 entries got=${r.length}` }),
      (r) => ({ pass: r.every(e => e.email_type === "VC"), msg: `all VC got=${r.map(e => e.email_type)}` }),
      (r) => ({ pass: r.some(e => (e as any).cargo?.toLowerCase().includes("wheat")), msg: `one has wheat` }),
      (r) => ({ pass: r.some(e => (e as any).cargo?.toLowerCase().includes("petcoke") || (e as any).cargo?.toLowerCase().includes("coke")), msg: `one has petcoke` }),
      (r) => ({ pass: r.some(e => (e as any).cargo?.toLowerCase().includes("fertil") || (e as any).cargo?.toLowerCase().includes("dap")), msg: `one has fertilizer/dap` }),
      (r) => ({ pass: r[0]?.confidence_score >= 0.55, msg: `entry[0] confidence>=0.55 got=${r[0]?.confidence_score}` }),
    ],
  },

  {
    id: "C05",
    label: "Complex — TC Circular with hire + duration range",
    level: "COMPLEX",
    emailBody: `
CONFIDENTIAL — TC REQUIREMENTS

ACCT: KLAVENESS COMBINATION CARRIERS
COMMODITY: BULK HARMLESS CARGO
VESSEL REQUIREMENT: KAMSARMAX / PANAMAX 75,000-82,000 DWT
DELIVERY: 1 SP APS ROTTERDAM
REDELIVERY: 1-2 SP WORLDWIDE
LAYCAN: 18TH - 22ND AUGUST 2025
DURATION: 11-13 MONTHS
HIRE RATE: USD 18,500/DAY
COMMISSION: 3.75% TOTAL (1.25% ADDR + 2.5% BROKERAGE)
NO SANCTIONED CARGOES
    `.trim(),
    expectedCount: 1,
    checks: [
      (r) => ({ pass: r[0]?.email_type === "TC", msg: `email_type=TC got=${r[0]?.email_type}` }),
      (r) => ({ pass: !!r[0] && "account_name" in r[0] && (r[0] as any).account_name?.includes("KLAVENESS"), msg: `account_name has KLAVENESS got=${(r[0] as any)?.account_name}` }),
      (r) => ({ pass: !!r[0] && "dwt" in r[0] && !!(r[0] as any).dwt, msg: `dwt set got=${(r[0] as any)?.dwt}` }),
      (r) => ({ pass: !!r[0] && "laycan_start" in r[0] && (r[0] as any).laycan_start === "2025-08-18", msg: `laycan_start=2025-08-18 got=${(r[0] as any)?.laycan_start}` }),
      (r) => ({ pass: !!r[0] && "hire_rate" in r[0] && (r[0] as any).hire_rate?.includes("18500"), msg: `hire_rate has 18500 got=${(r[0] as any)?.hire_rate}` }),
      (r) => ({ pass: !!r[0] && "duration" in r[0] && !!(r[0] as any).duration, msg: `duration set got=${(r[0] as any)?.duration}` }),
      (r) => ({ pass: r[0]?.confidence_score >= 0.70, msg: `confidence>=0.70 got=${r[0]?.confidence_score}` }),
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // EXPERT — Large broker emails, forwarded chains, maximum noise
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: "X01",
    label: "Expert — Large mixed broker circular (TC + Tonnage)",
    level: "EXPERT",
    emailBody: `
From: chartering@pacificbrokers.com
Subject: BROKER CIRCULAR - JULY POSITIONS

GOOD DAY — PLEASE FIND HEREWITH BELOW REQUIREMENTS AND POSITIONS:

=== TIME CHARTER REQUIREMENTS ===
------------------------------------
ACCT: ADANI PORTS AND SEZ
CARGO: COAL / PETCOKE IN BULK
TONNAGE: SUPRAMAX / ULTRAMAX 58,000-65,000 DWT
DEL: 1 SP WCI (MUNDRA / HAZIRA)
REDEL: WORLDWIDE INCL HRA EXCL EEXI/SANCTIONED
LC 22ND - 28TH JULY 2025
DURATION: 3-5 MONTHS
3.75 ADDCOM
------------------------------------
ACCT: VITOL SA
CARGO: GRAIN / SOYABEANS IN BULK
TONNAGE: KAMSARMAX 79,000-82,000 DWT
DEL: 1-2 SP ECSA RANGE
REDEL: 1-2 SP FAR EAST / INDIA
LC EARLY AUGUST 2025
DURATION: 55-70 DAYS
5% ADCOM TTL
------------------------------------

=== TONNAGE POSITIONS ===
------------------------------------
MV STELLAR PRIDE (IMO 9456789)
DWT: 75,200 / BLT 2016
FLAG: PANAMA / BULK CARRIER
OPEN SINGAPORE 25 JULY 2025
GRT: 40,856 / NRT: 25,312
LOA: 225M / BEAM: 32.26M
GRAIN CAP: 92,000 CBM
------------------------------------

Best Regards,
Pacific Maritime Brokers
    `.trim(),
    expectedCount: 3,
    checks: [
      (r) => ({ pass: r.length === 3, msg: `3 entries got=${r.length}` }),
      (r) => ({ pass: r.filter(e => e.email_type === "TC").length === 2, msg: `2 TC entries got=${r.filter(e => e.email_type === "TC").length}` }),
      (r) => ({ pass: r.filter(e => e.email_type === "Tonnage").length === 1, msg: `1 Tonnage entry got=${r.filter(e => e.email_type === "Tonnage").length}` }),
      (r) => ({ pass: r.some(e => e.email_type === "TC" && (e as any).account_name?.includes("ADANI")), msg: `one TC has ADANI` }),
      (r) => ({ pass: r.some(e => e.email_type === "TC" && (e as any).account_name?.includes("VITOL")), msg: `one TC has VITOL` }),
      (r) => ({ pass: r.some(e => e.email_type === "Tonnage" && (e as any).vessel_name?.includes("STELLAR PRIDE")), msg: `Tonnage has STELLAR PRIDE` }),
      (r) => ({ pass: r.some(e => e.email_type === "Tonnage" && (e as any).imo === "9456789"), msg: `Tonnage IMO=9456789` }),
      (r) => ({ pass: r.every(e => e.confidence_score >= 0.55), msg: `all confidence>=0.55` }),
    ],
  },

  {
    id: "X02",
    label: "Expert — Malformed / multiline broker chain",
    level: "EXPERT",
    emailBody: `
Pls see below and revert

---------- Forwarded message ---------
From: ops@asiabulkbrokers.com
Date: Mon, Jun 2, 2025

CARGO POSITIONS TODAY:

CARGO/COMMODITY: BAUXITE ORE
QTY: 55,000 MT +/- 10% MOLOO MOLCO
LOAD PORT: 1 SP BINTULU, MALAYSIA
DISCHARGE PORT:
2 SP ZHOUSHAN OR QINGDAO, CHINA

LAYCAN: 20 JULY ONWARDS
LOADING RATE: 20,000 MT/DAY PWWD SHINC
DISCHARGE RATE: 15,000 MT/DAY PWWD SHEX
TERMS: FIOS
COMMISSION: 3.75% TOTAL

=====================================

ANOTHER REQUIREMENT:

CARGO: THERMAL COAL
QTY: 75,000 MT MOLOO
LP: NEWCASTLE, AUSTRALIA
DP: SOUTH KOREA / JAPAN (2 SAFE PORTS)
LAYCAN: END JULY 2025
LR: 25,000 MT/DAY
DR: 20,000 MT/DAY
ADCOM: 2.5%

Best Regards
    `.trim(),
    expectedCount: 2,
    checks: [
      (r) => ({ pass: r.length === 2, msg: `2 entries got=${r.length}` }),
      (r) => ({ pass: r.every(e => e.email_type === "VC"), msg: `both VC got=${r.map(e => e.email_type)}` }),
      (r) => ({ pass: r.some(e => (e as any).cargo?.toLowerCase().includes("bauxite")), msg: `one has bauxite` }),
      (r) => ({ pass: r.some(e => (e as any).cargo?.toLowerCase().includes("coal")), msg: `one has coal` }),
      (r) => ({ pass: r.some(e => (e as any).laycan_start && (e as any).laycan_start.startsWith("2025-07")), msg: `at least one July laycan` }),
      (r) => ({ pass: r.every(e => e.confidence_score >= 0.50), msg: `all confidence>=0.50` }),
    ],
  },

  {
    id: "X03",
    label: "Expert — Full Tonnage vessel description with all fields",
    level: "EXPERT",
    emailBody: `
VESSEL POSITION:

NAME: MV ATLANTIC HORIZON
IMO NUMBER: 9567890
DWT: 56,800 MT
BUILT: 2012 / FLAG: BAHAMAS
VESSEL TYPE: BULK CARRIER (GEARED)
GRT: 33,044 / NRT: 20,116
LOA: 189.99M / BEAM: 32.26M
GRAIN CAPACITY: 71,888 CBM
NUMBER OF HOLDS: 5
NUMBER OF HATCHES: 5
CRANE: 4 X 30MT

OPEN: CHITTAGONG, BANGLADESH
DATE: 18TH JULY 2025
REGION: ECI / SEASIA

NO HRA WITHOUT EXTRA INSURANCE
    `.trim(),
    expectedCount: 1,
    checks: [
      (r) => ({ pass: r[0]?.email_type === "Tonnage", msg: `email_type=Tonnage got=${r[0]?.email_type}` }),
      (r) => ({ pass: !!r[0] && "vessel_name" in r[0] && (r[0] as any).vessel_name?.includes("ATLANTIC HORIZON"), msg: `vessel_name got=${(r[0] as any)?.vessel_name}` }),
      (r) => ({ pass: !!r[0] && "imo" in r[0] && (r[0] as any).imo === "9567890", msg: `imo=9567890 got=${(r[0] as any)?.imo}` }),
      (r) => ({ pass: !!r[0] && "dwt" in r[0] && (r[0] as any).dwt === "56800", msg: `dwt=56800 got=${(r[0] as any)?.dwt}` }),
      (r) => ({ pass: !!r[0] && "built_year" in r[0] && (r[0] as any).built_year === "2012", msg: `built_year=2012 got=${(r[0] as any)?.built_year}` }),
      (r) => ({ pass: !!r[0] && "grain_capacity" in r[0] && !!(r[0] as any).grain_capacity, msg: `grain_capacity set got=${(r[0] as any)?.grain_capacity}` }),
      (r) => ({ pass: !!r[0] && "loa" in r[0] && !!(r[0] as any).loa, msg: `loa set got=${(r[0] as any)?.loa}` }),
      (r) => ({ pass: !!r[0] && "grt" in r[0] && !!(r[0] as any).grt, msg: `grt set got=${(r[0] as any)?.grt}` }),
      (r) => ({ pass: !!r[0] && "open_date" in r[0] && (r[0] as any).open_date === "2025-07-18", msg: `open_date=2025-07-18 got=${(r[0] as any)?.open_date}` }),
      (r) => ({ pass: r[0]?.confidence_score >= 0.80, msg: `confidence>=0.80 got=${r[0]?.confidence_score}` }),
    ],
  },

  {
    id: "X04",
    label: "Expert — 4-block TC circular (no field leakage)",
    level: "EXPERT",
    emailBody: `
CONFIDENTIAL TC CIRCULAR — PLEASE TREAT WITH UTMOST DISCRETION

ACCT ARCHER DANIELS MIDLAND (ADM)
CARGO: SOYBEANS / GRAIN IN BULK
SIZE: 60,000-70,000 DWT ULTRAMAX
DEL: 1 SP SANTOS / PARANAGUA
REDEL: 1-2 SP FAR EAST / INDIA
LC 05-10 AUGUST 2025
DURATION: 55-70 DAYS TCT
5% ADCOM

ACCT BUNGE AGRI
CARGO: WHEAT OR BARLEY IN BULK
SIZE: 70,000-82,000 DWT PANAMAX/KAMSARMAX
DEL: 1 SP ECSA
REDEL: FAR EAST
LC MID AUGUST 2025
DURATION: 60-75 DAYS
3.75% ADCOM

ACCT NOBLE RESOURCES
CARGO: COAL / PETCOKE IN BULK
SIZE: 50,000-58,000 DWT SUPRAMAX
DEL: APS PASSING SPORE / SINGAPORE
REDEL: 1 SP WCI
LC 22-28 AUGUST 2025
DURATION: 35-45 DAYS
3.75 ADCOM

ACCT TRAFIGURA PTE
CARGO: CHROME ORE IN BULK
SIZE: 55,000-65,000 DWT
DEL: 1 SP WAFR
REDEL: 1 SP CHINA / FAR EAST
LC EARLY SEPTEMBER 2025
DURATION: ABT 45-55 DAYS
5% ADCOM
    `.trim(),
    expectedCount: 4,
    checks: [
      (r) => ({ pass: r.length === 4, msg: `4 entries got=${r.length}` }),
      (r) => ({ pass: r.every(e => e.email_type === "TC"), msg: `all TC got=${r.map(e => e.email_type)}` }),
      (r) => ({ pass: r.some(e => (e as any).account_name?.includes("ARCHER") || (e as any).account_name?.includes("ADM")), msg: `one has ADM/ARCHER` }),
      (r) => ({ pass: r.some(e => (e as any).account_name?.includes("BUNGE")), msg: `one has BUNGE` }),
      (r) => ({ pass: r.some(e => (e as any).account_name?.includes("NOBLE")), msg: `one has NOBLE` }),
      (r) => ({ pass: r.some(e => (e as any).account_name?.includes("TRAFIGURA")), msg: `one has TRAFIGURA` }),
      // Check no field leakage: each entry should have its own cargo
      (r) => {
        const cargos = r.map(e => (e as any).cargo?.toLowerCase() ?? "");
        const unique = new Set(cargos.filter(c => c.length > 2));
        return { pass: unique.size >= 3, msg: `at least 3 distinct cargos got=${[...unique]}` };
      },
      (r) => ({ pass: r.every(e => e.confidence_score >= 0.55), msg: `all confidence>=0.55` }),
    ],
  },

  {
    id: "X05",
    label: "Expert — Full mixed broker circular (VC+TC+Tonnage+noise)",
    level: "EXPERT",
    emailBody: `
WEEKLY MARKET CIRCULAR
Pacific Maritime Brokers — Strictly Private & Confidential
Date: June 02, 2025

============================================
SECTION A: CARGO REQUIREMENTS (VOYAGE CHARTER)
============================================

CARGO: IRON ORE
QUANTITY: 160,000 MT MOLOO 10% MOLCO
LP: 1 SP PARADIP / KAKINADA (ECI)
DP: 2-3 SP WEST AFRICA (WAFR)
LAYCAN: 22ND JULY 2025
LOADING RATE: 35,000 MT/DAY PWWD SHINC
DISCH RATE: 10,000 MT/DAY PWWD SHEX
3.75 ADDCOM — NO CHINESE CREW

============================================
SECTION B: TIME CHARTER REQUIREMENT
============================================

ACCT: COFCO INTERNATIONAL
CARGO: GRAIN / SOYA IN BULK
SIZE: KAMSARMAX 79,000-82,000 DWT
DELIVERY: 1 SP ECSA (BRAZIL RANGE)
REDELIVERY: 1-2 SP FAR EAST / SOUTH CHINA
LAYCAN: 15-20 AUGUST 2025
DURATION: 11-13 MONTHS
HIRE: USD 21,000 PER DAY
ADDCOM: 5% TTL

============================================
SECTION C: TONNAGE POSITIONS
============================================

MV CAPE MERCURY (IMO 9678901)
DWT: 180,500 SUMMER
BUILT: 2019 / FLAG: LIBERIA
CAPESIZE BULK CARRIER
OPEN ROTTERDAM 01 AUGUST 2025
GRT: 92,800 / NRT: 55,300
LOA: 292M / BEAM: 45M

============================================
Regards,
Alpha Beta Shipping Brokers
    `.trim(),
    expectedCount: 3,
    checks: [
      (r) => ({ pass: r.length === 3, msg: `3 entries got=${r.length}` }),
      (r) => ({ pass: r.some(e => e.email_type === "VC"), msg: `one VC entry` }),
      (r) => ({ pass: r.some(e => e.email_type === "TC"), msg: `one TC entry` }),
      (r) => ({ pass: r.some(e => e.email_type === "Tonnage"), msg: `one Tonnage entry` }),
      (r) => ({ pass: r.some(e => e.email_type === "TC" && (e as any).account_name?.includes("COFCO")), msg: `TC has COFCO account` }),
      (r) => ({ pass: r.some(e => e.email_type === "Tonnage" && (e as any).vessel_name?.includes("CAPE MERCURY")), msg: `Tonnage has CAPE MERCURY` }),
      (r) => ({ pass: r.some(e => e.email_type === "TC" && (e as any).hire_rate?.includes("21000")), msg: `TC has hire 21000` }),
      (r) => ({ pass: r.some(e => e.email_type === "VC" && (e as any).quantity === "160000"), msg: `VC qty=160000` }),
      (r) => ({ pass: r.every(e => e.confidence_score >= 0.55), msg: `all confidence>=0.55` }),
    ],
  },
];

// ─── Test Runner ──────────────────────────────────────────────────────────────

interface CheckResult { pass: boolean; msg: string; }
interface TestResult {
  id: string;
  label: string;
  level: string;
  pass: boolean;
  checkResults: CheckResult[];
  accuracy: number;
  extractedCount: number;
  expectedCount: number;
  durationMs: number;
}

function runTests(): void {
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}   MARITIME EMAIL EXTRACTION TEST SUITE — Enterprise v2.0      ${RESET}`);
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${RESET}\n`);

  const results: TestResult[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  for (const test of TESTS) {
    const startMs = Date.now();
    let extracted: ReturnType<typeof extractToEnterpriseJSON> = [];
    let error: string | null = null;

    try {
      extracted = extractToEnterpriseJSON(test.emailBody);
    } catch (e) {
      error = String(e);
    }

    const durationMs = Date.now() - startMs;
    const checkResults: CheckResult[] = [];

    if (error) {
      checkResults.push({ pass: false, msg: `EXCEPTION: ${error}` });
    } else {
      for (const check of test.checks) {
        try {
          checkResults.push(check(extracted));
        } catch (e) {
          checkResults.push({ pass: false, msg: `CHECK ERROR: ${e}` });
        }
      }
    }

    const passed = checkResults.filter(c => c.pass).length;
    const total = checkResults.length;
    const accuracy = total > 0 ? Math.round((passed / total) * 100) : 0;
    const allPass = passed === total;

    totalChecks += total;
    passedChecks += passed;

    results.push({
      id: test.id,
      label: test.label,
      level: test.level,
      pass: allPass,
      checkResults,
      accuracy,
      extractedCount: extracted.length,
      expectedCount: test.expectedCount,
      durationMs,
    });

    // Level badge colors
    const levelColor = test.level === "EASY" ? GREEN :
      test.level === "MEDIUM" ? YELLOW :
      test.level === "COMPLEX" ? "\x1b[35m" : RED;

    const statusIcon = allPass ? `${GREEN}✓ PASS${RESET}` : `${RED}✗ FAIL${RESET}`;
    const accColor = accuracy >= 90 ? GREEN : accuracy >= 70 ? YELLOW : RED;

    console.log(`${BOLD}[${test.id}]${RESET} ${levelColor}[${test.level}]${RESET} ${test.label}`);
    console.log(`       Status: ${statusIcon}  |  Accuracy: ${accColor}${accuracy}%${RESET} (${passed}/${total} checks)  |  Entries: ${extracted.length}/${test.expectedCount}  |  ${durationMs}ms`);

    if (!allPass) {
      for (const cr of checkResults) {
        if (!cr.pass) {
          console.log(`       ${RED}  ✗ ${cr.msg}${RESET}`);
        }
      }
    }

    // Show confidence scores
    if (extracted.length > 0) {
      const scores = extracted.map(e => `${e.email_type}:${e.confidence_score.toFixed(3)}`).join("  ");
      console.log(`       ${DIM}Confidence: ${scores}${RESET}`);
    }

    console.log();
  }

  // ─── Summary ───────────────────────────────────────────────────────────
  const totalTests = results.length;
  const passedTests = results.filter(r => r.pass).length;
  const overallAccuracy = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  const avgConfidence = TESTS.reduce((sum, test) => {
    try {
      const r = extractToEnterpriseJSON(test.emailBody);
      return sum + (r.length > 0 ? r.reduce((s, e) => s + e.confidence_score, 0) / r.length : 0);
    } catch { return sum; }
  }, 0) / TESTS.length;

  const levelGroups: Record<string, { pass: number; total: number }> = {};
  for (const r of results) {
    if (!levelGroups[r.level]) levelGroups[r.level] = { pass: 0, total: 0 };
    levelGroups[r.level].total++;
    if (r.pass) levelGroups[r.level].pass++;
  }

  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  TEST SUMMARY${RESET}`);
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${RESET}`);
  console.log(`  Tests Passed  : ${passedTests >= totalTests ? GREEN : RED}${passedTests}/${totalTests}${RESET}`);
  console.log(`  Checks Passed : ${passedChecks}/${totalChecks}`);
  console.log(`  Overall Check Accuracy : ${overallAccuracy >= 90 ? GREEN : overallAccuracy >= 75 ? YELLOW : RED}${overallAccuracy}%${RESET}`);
  console.log(`  Avg Confidence Score   : ${avgConfidence >= 0.75 ? GREEN : YELLOW}${avgConfidence.toFixed(3)}${RESET}`);
  console.log();
  console.log(`  By Difficulty:`);
  for (const [level, stats] of Object.entries(levelGroups)) {
    const pct = Math.round((stats.pass / stats.total) * 100);
    const color = pct === 100 ? GREEN : pct >= 75 ? YELLOW : RED;
    console.log(`    ${level.padEnd(10)}: ${color}${stats.pass}/${stats.total} tests (${pct}%)${RESET}`);
  }
  console.log();

  if (overallAccuracy >= 95) {
    console.log(`${BOLD}${GREEN}  🎯 TARGET ACHIEVED: ${overallAccuracy}% accuracy meets 95-97% enterprise target!${RESET}`);
  } else if (overallAccuracy >= 85) {
    console.log(`${BOLD}${YELLOW}  ⚡ NEAR TARGET: ${overallAccuracy}% — close to 95% enterprise target${RESET}`);
  } else {
    console.log(`${BOLD}${RED}  ⚠ BELOW TARGET: ${overallAccuracy}% — target is 95-97%${RESET}`);
  }
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${RESET}\n`);

  process.exit(passedTests === totalTests ? 0 : 1);
}

runTests();
