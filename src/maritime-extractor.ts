// Maritime Email Extraction Engine — Enterprise Grade v2.0
// Rule-Based + Heuristic NLP | Dynamic Schema | Multi-Order | High Accuracy
import { runMLModel }
from "./ml/mlConnector.js";
export type EmailType = "VC" | "TC" | "Tonnage" | "Mixed" | "Unknown";
export type Pipeline = "rule-based" | "template" | "llm-fallback";
export type EntryType = "VC" | "TC" | "Tonnage";

export interface ExtractedFields {
  email_type?: string | null;
  cargo_name?: string | null;
  account_name?: string | null;
  cargo_type?: string | null;
  tonnage_name?: string | null;
  tonnage_type?: string | null;
  min_size?: number | null;
  max_size?: number | null;
  region?: string | null;
  matching_region?: string | null;
  load_port?: string | null;
  discharge_port?: string | null;
  del_port?: string | null;
  redel_port?: string | null;
  port?: string | null;
  open_date?: string | null;
  close_date?: string | null;
  laycan_start_date?: string | null;
  laycan_end_date?: string | null;
  duration?: string | null;
  dwt?: string | null;
  imo?: string | null;
  grt?: string | null;
  nrt?: string | null;
  loa?: string | null;
  beam?: string | null;
  grain_capacity?: string | null;
  load_rate?: string | null;
  discharge_rate?: string | null;
  commission?: string | null;
  pic?: string | null;
  email_id?: string | null;
  phone_number?: string | null;
  restriction?: string | null;
  reason?: string | null;
  built_year?: string | null;
  flag?: string | null;
  hire_rate?: string | null;
  latitude?: string | null;
  longitude?: string | null;
}

export interface ExtractedEntry {
  entryType: EntryType;
  confidence: number;
  extractionMethod: Pipeline;
  fields: ExtractedFields;
}

export interface ExtractionResult {
  emailType: EmailType;
  pipeline: Pipeline;
  confidence: number;
  extractedEntries: ExtractedEntry[];
  processingMs: number;
  llmUsed: boolean;
  estimatedCostUsd: number;
}

// ─── Dynamic Enterprise JSON Schemas ──────────────────────────────────────────

export interface TonnageEntry {
  email_type: "Tonnage";
  vessel_name: string;
  vessel_type: string;
  dwt: string;
  built_year: string;
  flag: string;
  imo: string;
  grt: string;
  nrt: string;
  loa: string;
  beam: string;
  grain_capacity: string;
  open_port: string;
  open_date: string;
  close_date: string;
  matching_region: string;
  restrictions: string[];
  confidence_score: number;
}

export interface TCEntry {
  email_type: "TC";
  account_name: string;
  cargo: string;
  cargo_type: string;
  dwt: string;
  del_port: string;
  redel_port: string;
  laycan_start: string;
  laycan_end: string;
  duration: string;
  hire_rate: string;
  commission: string;
  matching_region: string;
  restrictions: string[];
  confidence_score: number;
}

export interface VCEntry {
  email_type: "VC";
  cargo: string;
  cargo_type: string;
  quantity: string;
  quantity_unit: "MT";
  load_port: string;
  discharge_port: string;
  laycan_start: string;
  laycan_end: string;
  load_rate: string;
  discharge_rate: string;
  commission: string;
  matching_region: string;
  restrictions: string[];
  confidence_score: number;
}

export type EnterpriseEntry = TonnageEntry | TCEntry | VCEntry;

// ─── Maritime Knowledge Base — Expanded ───────────────────────────────────────

const REGION_MAP: Record<string, string> = {
  // Africa
  WAFR: "West Africa", WAFR1: "West Africa", SAFR: "South Africa",
  EAFR: "East Africa", NWAFRICA: "West Africa", "W.AFRICA": "West Africa",
  WCOAST: "West Africa",
  // India
  ECI: "East Coast India", WCI: "West Coast India", WCI1: "West Coast India",
  "E.C.INDIA": "East Coast India", "W.C.INDIA": "West Coast India",
  WCIND: "West Coast India", ECIND: "East Coast India",
  // SE Asia
  "S.E.ASIA": "South East Asia", SEASIA: "South East Asia", SEA: "South East Asia",
  "TM SEA": "South East Asia", TMSEA: "South East Asia",
  FEASTASIA: "Far East Asia",
  // Middle East / Gulf
  AG: "Arabian Gulf", PG: "Persian Gulf", ARAG: "Arabian Gulf",
  "A.GULF": "Arabian Gulf", AGULF: "Arabian Gulf", "P.GULF": "Persian Gulf",
  MEG: "Middle East Gulf", GULF: "Arabian Gulf",
  // Mediterranean / Europe
  MED: "Mediterranean", BSEA: "Black Sea", "B.SEA": "Black Sea",
  BLSEA: "Black Sea", BALTIC: "Baltic Sea", NEUROPEAN: "North European",
  NEUROP: "North European", "N.EUROP": "North European",
  ARA: "ARA Range", NTHR: "North European", CONT: "Continent (ARA)",
  EMED: "East Mediterranean", WMED: "West Mediterranean",
  // Americas
  USEC: "US East Coast", USGC: "US Gulf Coast", USG: "US Gulf Coast",
  USWC: "US West Coast", WCCA: "West Coast Central America",
  WCSA: "West Coast South America", ECSA: "East Coast South America",
  "UP RIVER": "Upriver, Argentina", UPRIVER: "Upriver, Argentina",
  // Routing / Other
  GOA: "Gulf of Aden", HRA: "High Risk Area", COGH: "Cape of Good Hope",
  WWW: "World Wide", WW: "World Wide", "W.W.": "World Wide",
  SPORE: "Singapore", SSPORE: "Singapore",
  SCHINA: "South China", NCHINA: "North China", JAPAN: "Japan",
  "S.KOREA": "South Korea", SKOREA: "South Korea",
  RECALADA: "East Coast South America", SANTOS: "East Coast South America",
  HOUSTON: "US Gulf Coast", TAMPA: "US Gulf Coast",
  FAREAST: "Far East", "F.EAST": "Far East",
  INDONESIA: "Indonesia", PHILIPPINES: "Philippines",
  VIETNAM: "Vietnam", THAILAND: "Thailand",
  PAKISTAN: "Pakistan", BANGLADESH: "Bangladesh",
  CHINA: "China", INDIA: "India", TAIWAN: "Taiwan",
  TURKEY: "Turkey", UKRAINE: "Ukraine", RUSSIA: "Russia",
  BRAZIL: "Brazil", ARGENTINA: "Argentina",
};

const PORT_ABBREVS: Record<string, string> = {
  // India
  BIK: "Bandar Imam Khomeini, Iran", KANDLA: "Kandla, India",
  KAKINADA: "Kakinada, India", VIZAG: "Visakhapatnam, India",
  MORMUGAO: "Mormugao, India", KRISHNAPATNAM: "Krishnapatnam, India",
  GANGAVARAM: "Gangavaram, India", ENNORE: "Ennore, India",
  MUMBAI: "Mumbai, India", HAZIRA: "Hazira, India", NHAVA: "Nhava Sheva, India",
  HALDIA: "Haldia, India", PARADIP: "Paradip, India",
  MANGALORE: "Mangalore, India", COCHIN: "Cochin, India", TUTICORIN: "Tuticorin, India",
  PORBANDAR: "Porbandar, India", MUNDRA: "Mundra, India",
  SIKKA: "Sikka, India", OKHA: "Okha, India", PIPAVAV: "Pipavav, India",
  // SE Asia
  LUMUT: "Lumut, Malaysia", SURABAYA: "Surabaya, Indonesia",
  BAHODOPI: "Bahodopi, Indonesia", CIGADING: "Cigading, Indonesia",
  PAITON: "Paiton, Indonesia", TELUKBAYUR: "Teluk Bayur, Indonesia",
  BONTANG: "Bontang, Indonesia",
  SINGAPORE: "Singapore", PORTKLANG: "Port Klang, Malaysia",
  COLOMBO: "Colombo, Sri Lanka",
  // South America
  SANTOS: "Santos, Brazil", PARANAGUA: "Paranaguá, Brazil",
  UPRIVER: "Upriver, Argentina", "SAN LORENZO": "San Lorenzo, Argentina",
  ROSARIO: "Rosario, Argentina", BAHIABLANCA: "Bahia Blanca, Argentina",
  ITAQUI: "Itaqui, Brazil", PONTA: "Ponta da Madeira, Brazil",
  // Middle East
  AQABA: "Aqaba, Jordan", BUSHEHR: "Bushehr, Iran", DOHA: "Doha, Qatar",
  HODEIDAH: "Hodeidah, Yemen", JEDDAH: "Jeddah, Saudi Arabia",
  DAMMAM: "Dammam, Saudi Arabia", SHUAIBA: "Shuaiba, Kuwait",
  MINA: "Mina Al Ahmadi, Kuwait", KHOR: "Khor Fakkan, UAE",
  // Black Sea / Med
  PIVDENNIY: "Pivdenniy, Ukraine", ISKENDERUN: "Iskenderun, Turkey",
  SKAW: "Skaw, Denmark", ALGIERS: "Algiers, Algeria",
  TRIPOLI: "Tripoli, Libya", TUNISIE: "Tunis, Tunisia",
  ODESSA: "Odessa, Ukraine", CONSTANTA: "Constanta, Romania",
  NOVOROSSIYSK: "Novorossiysk, Russia",
  // Africa
  DURBAN: "Durban, South Africa", WALVIS: "Walvis Bay, Namibia",
  DAKAR: "Dakar, Senegal", ABIDJAN: "Abidjan, Ivory Coast",
  LAGOS: "Lagos, Nigeria", POINTE: "Pointe Noire, Congo",
  // East Asia
  BUKPYUNG: "Bukpyung, South Korea", GUANGZHOU: "Guangzhou, China",
  TAIPEI: "Taipei, Taiwan", LANSHAN: "Lanshan, China",
  QINGDAO: "Qingdao, China", TIANJIN: "Tianjin, China",
  NINGBO: "Ningbo, China", ZHOUSHAN: "Zhoushan, China",
  SHANGHAI: "Shanghai, China", LIANYUNGANG: "Lianyungang, China",
  BUSAN: "Busan, South Korea", POHANG: "Pohang, South Korea",
  NAGOYA: "Nagoya, Japan", OSAKA: "Osaka, Japan", TOKYO: "Tokyo, Japan",
  // Europe / N America
  CHITTAGONG: "Chittagong, Bangladesh", KARACHI: "Karachi, Pakistan",
  VANCOUVER: "Vancouver, Canada", BALTIMORE: "Baltimore, USA",
  HOUSTON: "Houston, USA", ROTTERDAM: "Rotterdam, Netherlands",
  ANTWERP: "Antwerp, Belgium", HAMBURG: "Hamburg, Germany",
  DUNKIRK: "Dunkirk, France", GDANSK: "Gdansk, Poland",
  PHILADELPHIA: "Philadelphia, USA", NORFOLK: "Norfolk, USA",
  MOBILE: "Mobile, USA", NEWORLEANS: "New Orleans, USA",
};

const VESSEL_SIZE_MAP: Record<string, { min: number; max: number; type: string }> = {
  HANDYSIZE: { min: 10000, max: 39999, type: "Handysize Bulk Carrier" },
  HANDY: { min: 10000, max: 39999, type: "Handysize Bulk Carrier" },
  HANDYMAX: { min: 35000, max: 49999, type: "Handymax Bulk Carrier" },
  HMAX: { min: 35000, max: 49999, type: "Handymax Bulk Carrier" },
  SUPRAMAX: { min: 50000, max: 59999, type: "Supramax Bulk Carrier" },
  SMAX: { min: 50000, max: 59999, type: "Supramax Bulk Carrier" },
  SMX: { min: 50000, max: 59999, type: "Supramax Bulk Carrier" },
  SUPRA: { min: 50000, max: 59999, type: "Supramax Bulk Carrier" },
  ULTRAMAX: { min: 60000, max: 69999, type: "Ultramax Bulk Carrier" },
  UMAX: { min: 60000, max: 69999, type: "Ultramax Bulk Carrier" },
  UMX: { min: 60000, max: 69999, type: "Ultramax Bulk Carrier" },
  ULTRA: { min: 60000, max: 69999, type: "Ultramax Bulk Carrier" },
  PANAMAX: { min: 70000, max: 79999, type: "Panamax Bulk Carrier" },
  PMX: { min: 70000, max: 79999, type: "Panamax Bulk Carrier" },
  KAMSARMAX: { min: 80000, max: 89999, type: "Kamsarmax Bulk Carrier" },
  KMAX: { min: 80000, max: 89999, type: "Kamsarmax Bulk Carrier" },
  "BABY CAPE": { min: 90000, max: 199999, type: "Post-Panamax Bulk Carrier" },
  CAPESIZE: { min: 150000, max: 999999, type: "Capesize Bulk Carrier" },
  CAPE: { min: 150000, max: 999999, type: "Capesize Bulk Carrier" },
  POST: { min: 80000, max: 99999, type: "Post-Panamax Bulk Carrier" },
  SDBC: { min: 50000, max: 79999, type: "Standard Dry Bulk Carrier" },
  MR: { min: 25000, max: 54999, type: "MR Tanker" },
  LR1: { min: 55000, max: 79999, type: "LR1 Tanker" },
  LR2: { min: 80000, max: 159999, type: "LR2 Tanker" },
  VLCC: { min: 200000, max: 320000, type: "VLCC Tanker" },
  AFRAMAX: { min: 80000, max: 119999, type: "Aframax Tanker" },
  SUEZMAX: { min: 120000, max: 199999, type: "Suezmax Tanker" },
};

const CARGO_ALIASES: Record<string, string> = {
  // Coal
  "COAL": "Coal", "STEAM COAL": "Steam Coal", "THERMAL COAL": "Thermal Coal",
  "THER COAL": "Thermal Coal", "PCI COAL": "PCI Coal", "MET COAL": "Metallurgical Coal",
  "COKING COAL": "Coking Coal",
  // Iron / Steel
  "IRON ORE": "Iron Ore", "IRON FINES": "Iron Ore Fines", "IRON PELLETS": "Iron Ore Pellets",
  "IRON SLAG": "Iron Slag", "SLAG": "Slag", "STEEL SCRAP": "Steel Scrap",
  "STEEL COILS": "Steel Coils", "STEEL BILLETS": "Steel Billets",
  // Fertilizers
  "UREA": "Urea", "DAP": "DAP Fertilizer", "MOP": "MOP Fertilizer",
  "NPK": "NPK Fertilizer", "AN": "Ammonium Nitrate", "UAN": "Urea Ammonium Nitrate",
  "FERTS": "Fertilizers", "FERT": "Fertilizers",
  "FERTILIZER": "Fertilizers", "FERTILIZERS": "Fertilizers",
  "FERTILISERS": "Fertilizers", "FERTILISER": "Fertilizers",
  "SUPERPHOSPHATE": "Superphosphate", "TSP": "Triple Superphosphate",
  "POTASH": "Potash", "SOP": "Sulphate of Potash",
  // Grains
  "GRAIN": "Grain", "GRAINS": "Grain", "WHEAT": "Wheat", "BARLEY": "Barley",
  "MAIZE": "Maize", "CORN": "Corn", "RICE": "Rice", "MILLET": "Millet",
  "SORGHUM": "Sorghum", "OATS": "Oats", "RYE": "Rye",
  "SOYA BEANS": "Soybeans", "SOYABEANS": "Soybeans", "SOYBEANS": "Soybeans",
  "SOYBEAN": "Soybeans", "GRAIN/SOYA": "Grain/Soybean",
  "SOYBEAN MEAL": "Soybean Meal", "SOYA MEAL": "Soybean Meal",
  "SUNFLOWER MEAL": "Sunflower Meal",
  // Minerals
  "LIMESTONE": "Limestone", "CALCIUM CARBONATE": "Calcium Carbonate",
  "CHROME ORE": "Chrome Ore", "BAUXITE": "Bauxite",
  "MANGANESE": "Manganese Ore", "NICKEL ORE": "Nickel Ore",
  "COPPER CONC": "Copper Concentrate", "COPPER CONCENTRATE": "Copper Concentrate",
  "CLINKER": "Clinker", "GYPSUM": "Gypsum", "BENTONITE": "Bentonite",
  "SALT": "Salt", "SULPHUR": "Sulphur", "SULFUR": "Sulphur",
  "PHOSPHATE": "Phosphate Rock", "ROCK PHOSPHATE": "Phosphate Rock",
  "SAND": "Sand", "SILICA SAND": "Silica Sand",
  // Oil / Petrochemicals
  "PETCOKE": "Petroleum Coke", "PET COKE": "Petroleum Coke", "PETROLEUM COKE": "Petroleum Coke",
  "RAW SUGAR": "Raw Sugar", "SUGAR": "Sugar",
  // Harmless / General
  "BULK HARMLESS": "Bulk Harmless Cargo", "BULK HARMLESS CARGO": "Bulk Harmless Cargo",
  "LAWFUL BULK": "Lawful Bulk Cargo", "HARMLESS BULK": "Bulk Harmless Cargo",
  "GENERAL CARGO": "General Cargo",
};

const CARGO_TYPE_MAP: Record<string, string> = {
  // Dry Bulk
  BULK: "Dry Bulk", GRAIN: "Dry Bulk", COAL: "Dry Bulk",
  FERTILIZER: "Dry Bulk", FERTILIZERS: "Dry Bulk", FERTILISER: "Dry Bulk",
  FERTS: "Dry Bulk", FERT: "Dry Bulk", UREA: "Dry Bulk",
  IRON: "Dry Bulk", SLAG: "Dry Bulk", CLINKER: "Dry Bulk",
  PETCOKE: "Dry Bulk", LIMESTONE: "Dry Bulk", MAIZE: "Dry Bulk",
  CORN: "Dry Bulk", SOYBEAN: "Dry Bulk", SOYA: "Dry Bulk", SOYBEANS: "Dry Bulk",
  POTASH: "Dry Bulk", SULPHUR: "Dry Bulk", SULFUR: "Dry Bulk", SALT: "Dry Bulk",
  BAUXITE: "Dry Bulk", MANGANESE: "Dry Bulk", WHEAT: "Dry Bulk",
  BARLEY: "Dry Bulk", RICE: "Dry Bulk", DAP: "Dry Bulk",
  MOP: "Dry Bulk", NPK: "Dry Bulk", CHROME: "Dry Bulk",
  NICKEL: "Dry Bulk", COPPER: "Dry Bulk", SUGAR: "Dry Bulk",
  GYPSUM: "Dry Bulk", BENTONITE: "Dry Bulk", PHOSPHATE: "Dry Bulk",
  SAND: "Dry Bulk", MILLET: "Dry Bulk", SORGHUM: "Dry Bulk",
  CALCIUM: "Dry Bulk", SUPERPHOSPHATE: "Dry Bulk",
  HARMLESS: "Dry Bulk", LAWFUL: "Dry Bulk",
  // General Cargo
  COILS: "General Cargo", STEEL: "General Cargo", STEELS: "General Cargo",
  BILLETS: "General Cargo", SCRAP: "General Cargo",
  GENS: "General Cargo", LOGS: "General Cargo", LOG: "General Cargo",
  PIPES: "General Cargo", EQUIPMENT: "General Cargo",
  // Liquid / Tanker
  CRUDE: "Crude Oil", CHEMICAL: "Chemical", CHEMICALS: "Chemical",
  GAS: "Gas", LPG: "Gas", LNG: "Gas",
};

// Terms that are NEVER cargo — broker/operational/structural terms
const CARGO_BLACKLIST = new Set([
  "HOLD", "HOLDS", "ENGINE", "BRIDGE", "AFT", "ACCOMMODATION",
  "BUNKERS", "FUEL", "BALLAST", "BOW", "STERN", "DECK",
  "HATCH", "HATCHES", "WINCH", "CRANE", "GEAR", "MAIN ENGINE",
  "AFT PEAK", "FORE PEAK", "VOID SPACE", "PAINT", "BULK HARMLESS",
  "ENGINE/BRIDGE AFT", "BRIDGE AFT",
  // Broker / charterparty operational terms
  "ADCOM", "ADDCOM", "COMMISSION", "COMM", "CHARTERER", "OWNER",
  "BROKERS", "BROKER", "ACCOUNT", "ACCT", "DIRECT", "PRINCIPAL",
  "VOYAGE ORDERS", "TCT", "TTL", "TOTAL", "MOLOO", "MOLCO",
  "DLOSP", "FIOST", "FIOS", "LINER", "TERMS",
  "APS", "AFS", "TIP", "POL", "POD",
]);

// Regex patterns for terms that indicate lines are NOT cargo
const CARGO_BLACKLIST_PATTERNS = [
  /ENGINE\s*\/?\s*BRIDGE/i, /BRIDGE\s*AFT/i, /MAIN\s*ENGINE/i, /VOID\s*SPACE/i,
  /^\s*(?:A\/C|ACCT?|Account)\s*:/i, /^\s*ADCOM\s/i, /^\s*ADDCOM\s/i,
  /^\s*COMM(?:ISSION)?\s*:/i,
  // NOTE: do NOT add a generic person-name pattern here — it would block
  // normalized cargo names like "Steam Coal", "Iron Ore", "Petroleum Coke"
  /\bPHONE\b|\bMOBILE\b|\bWHATSAPP\b/i,
  /^(HOLD|HATCH|DECK|WINCH|CRANE)\b/i,
];

const SHIP_PART_WORDS = new Set([
  "HOLD", "HOLDS", "HATCH", "HATCHES", "DECK", "CRANE", "WINCH", "GEAR",
  "ENGINE", "BRIDGE", "BOW", "STERN", "AFT", "FORE",
]);

// ─── Validators ───────────────────────────────────────────────────────────────

function isValidPort(text: string): boolean {
  if (!text) return false;
  const t = text.trim().toUpperCase();
  if (t.length <= 2) return false;
  if (REGION_MAP[t] !== undefined) return false;
  if (t.length <= 3 && !PORT_ABBREVS[t]) return false;
  if (/^\d/.test(t)) return false;
  if (/^\d+$/.test(t)) return false;
  if (/^\d+SP\b/i.test(t)) return false;
  // Reject charterparty terms
  if (/^(?:MOLOO|MOLCO|FIOST|FIOS|LINER|DLOSP|CHOPT|APS|AFS|TIP|DIRECT)$/i.test(t)) return false;
  return true;
}

function isValidCargo(name: string): boolean {
  if (!name) return false;
  const t = name.trim().toUpperCase();
  if (t.length < 3) return false;
  if (CARGO_BLACKLIST.has(t)) return false;
  for (const pat of CARGO_BLACKLIST_PATTERNS) {
    if (pat.test(name)) return false;
  }
  // Reject if any word is a ship part
  const words = t.split(/\s+/);
  if (words.every(w => SHIP_PART_WORDS.has(w))) return false;
  return true;
}

function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.trim();
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length < 8) return false;
  if (/^\d\)/.test(cleaned)) return false;
  if (!/^[\+\d\s\-()\[\]\.#,]+$/.test(cleaned)) return false;
  if (/%/.test(cleaned)) return false;
  return true;
}

function normalizeDwtNumber(raw: string | null): string {
  if (!raw) return "";
  const kMatch = raw.trim().match(/^(\d+(?:\.\d+)?)\s*[Kk]$/);
  if (kMatch) {
    const val = Math.round(parseFloat(kMatch[1]) * 1000);
    return val >= 1000 ? val.toString() : "";
  }
  const num = parseInt(raw.replace(/[,.\s]/g, ""), 10);
  if (isNaN(num) || num < 1000) return "";
  return num.toString();
}

function fixDates(open: string | null, close: string | null): { open: string; close: string } {
  if (!open) return { open: "", close: close || "" };
  if (!close) return { open, close: "" };
  const openTs = new Date(open).getTime();
  const closeTs = new Date(close).getTime();
  if (!isNaN(openTs) && !isNaN(closeTs) && closeTs < openTs) {
    const newClose = new Date(openTs + 5 * 86400000).toISOString().split("T")[0];
    return { open, close: newClose };
  }
  return { open, close };
}

// ─── Patterns ─────────────────────────────────────────────────────────────────

const PATTERNS = {
  account: /(?:A\/C|ACCT?|Account|Charterer)[:\s*]+([^\n*\/]+)/i,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(?:Mobile|Phone|WhatsApp|Contact|Tel|Mob)\s*[/\s:]*(\+?[\d][\d\s\-().+]{7,24})/gi,
  dwtRange: /(\d{1,3}(?:[.,]\d{3})?)(K?)\s*[-–]\s*(\d{1,3}(?:[.,]\d{3})?)(K?)\s*(?:DWT|DEADWEIGHT)/i,
  dwtSingle: /(\d{1,3}(?:[.,]\d{3})?)(K?)\s*(?:DWT|DEADWEIGHT)/i,
  laycan: /LAYCAN[:\s]+([^\n]+)/i,
  duration: /DURATION[:\s*]+(?:ABT\s+)?(\d+)\s*(?:TO|[-–])\s*(\d+)\s*(?:DAYS?|MONTHS?|YRS?)/i,
  durationSingle: /DURATION[:\s*]+(?:ABT\s+)?(\d+)\s*(?:DAYS?|MONTHS?|YRS?)/i,
  delivery: /(?:DELY?|DEL|DELIVERY)[:\s*]+([^\n*]+)/i,
  redelivery: /(?:REDELY?|REDEL|RE-DELY?|REDELIVERY)[:\s*]+([^\n*]+)/i,
  loadPort: /(?:LP|LOADING\s*PORT?|POL|LOAD\s*PORT)[:\s]+([^\n]+)/i,
  dischargePort: /(?:DP|DISCHARGE\s*PORT?|POD|DISCH\s*PORT)[:\s]+([^\n]+)/i,
  cargo: /(?:CARGO|COMMODITY|COMMODIT)[:\s*]+([^\n*]+)/i,
  tonnage: /(?:TONNAGE|VESSEL)[:\s*]+([^\n*]+)/i,
  imo: /IMO\s*(?:NO?\.?\s*|NUMBER\s*)?[:\-]?\s*(\d{7})/i,
  grt: /(?:GRT|GT|GROSS\s*(?:REG(?:ISTERED)?\s*)?TON(?:NAGE)?)\s*[:\-\/]*\s*([\d,.\s]{4,12})/i,
  nrt: /(?:NRT|NT|NET\s*(?:REG(?:ISTERED)?\s*)?TON(?:NAGE)?)\s*[:\-\/]*\s*([\d,.\s]{4,12})/i,
  loa: /(?:LOA|LENGTH\s*(?:OVERALL)?)\s*[:\-\/]*\s*(\d+(?:[.,]\d+)?)\s*(?:M|MTS?)?/i,
  beam: /(?:BEAM|BREADTH|MOULDED\s*BREADTH)\s*[:\-\/]*\s*(\d+(?:[.,]\d+)?)\s*(?:M|MTS?)?/i,
  grainCap: /GRAIN\s*(?:CAPACITY|CAP(?:ACITY)?)\s*[:\-\/]*\s*([\d,.\s]{4,12})/i,
  loadRate: /(?:LOAD(?:ING)?\s*RATE|L\/?R|LDRATE|LDNG\s*RATE)\s*[:\-]*\s*([\d,]{3,10})\s*(?:MT\s*\/?\s*D(?:AY)?|PDPR?|PMD|MTONS)/i,
  dischargeRate: /(?:DISCH(?:ARGE)?\s*RATE|D\/?R|DISRATE|DSCRG\s*RATE)\s*[:\-]*\s*([\d,]{3,10})\s*(?:MT\s*\/?\s*D(?:AY)?|PDPR?|PMD|MTONS)/i,
  commission: /(?:ADCOM|ADD(?:RESS)?\s*COMM(?:ISSION)?|COMM(?:ISSION)?|BROKERAGE)\s*[:\s]*(\d+(?:\.\d+)?)\s*(?:%|PCT)?/i,
  commissionReverse: /(\d+(?:\.\d+)?)\s*(?:PCT|%)\s*(?:TTL|TOTAL|COMM|ADCOM|ADD)/i,
  quantity: /(?:M\/M\s*)?(\d{1,3}(?:[,.\s]\d{3})*)\s*(?:MTS?|METRIC\s*TONS?)/i,
  quantityRange: /(\d{1,3}(?:[,.\s]\d{3})*)\s*[-–]\s*(\d{1,3}(?:[,.\s]\d{3})*)\s*(?:MTS?|METRIC\s*TONS?)/i,
  restriction: /(?:NO\s+(?:CHINESE|PAKISTANI|IRANIAN|ISRAELI|SANCTIONED|HRA|GOA|RED\s*SEA|NORTH\s*KOREA|RUSSIA)[^\n]*|EXCL\s+(?:HRA|GOA|RED\s*SEA|IRANIAN)[^\n]*)/gi,
  mvName: /\bM[TV]\/?\s+([A-Z][A-Z0-9\s.'-]+?)(?:\s*[\(\/'"]|\s+\d{4}BLT|\s+\d{2,3}K\s|\n|\s+IMO|\s+BUILT)/i,
  hireRate: /(?:HIRE(?:\s*RATE)?|TCH?)\s*[:\-]*\s*(?:USD?\.?\s*)?(\d{1,3}(?:,\d{3})+|\d{4,6})\s*(?:\/?\s*(?:PER\s+DAY|DAY|PDPR?|PMD|PDPW|DPP?))?/i,
  builtYear: /(?:(?:BUILT|BLT)[:\s\/.]*(\d{4})|(\d{4})\s*(?:BLT|BUILT)\b)/i,
  flag: /\bFLAG[:\s]+([A-Z][A-Z ]{1,20}?)(?:\s*[\/\n,]|$)/im,
};

// ─── Preprocessing ────────────────────────────────────────────────────────────

// Lines that indicate start of email footer / signature block
const SIGNATURE_TRIGGERS = [
  /^(?:Best\s+Regards?|Kind\s+Regards?|Regards?|Thanks?\s+&?\s+Regards?|Warm\s+Regards?)\s*[,.]?\s*$/i,
  /^(?:Yours?\s+(?:faithfully|sincerely|truly))\s*[,.]?\s*$/i,
  /^(?:With\s+(?:best\s+)?regards?)\s*[,.]?\s*$/i,
  /^(?:Cheers?|Thanks?)\s*[,.]?\s*$/i,
  /^(?:Sent\s+from\s+my\s+(?:iPhone|Android|Samsung|BlackBerry))/i,
  /^(?:This\s+message\s+(?:contains|is)\s+(?:confidential|intended))/i,
  /^(?:DISCLAIMER|CONFIDENTIALITY\s+NOTICE|LEGAL\s+NOTICE)\b/i,
  /^(?:---+\s*Original\s+Message\s*---+)/i,
  /^(?:From:|Sent:|To:|Subject:)\s+.{3,}/i,
  /^(?:>{1,3}\s*From:|>{1,3}\s*Sent:)/i,
  // BIMCO / standard legal boilerplate
  /^(?:BIMCO\s+STANDARD)/i,
  /^(?:This\s+e-?mail\s+and\s+any\s+attachment)/i,
  /^(?:The\s+information\s+(?:contained|transmitted)\s+in\s+this)/i,
  // Social / IM footers
  /^(?:Connect\s+with\s+(?:me|us)\s+on|Follow\s+us\s+on)/i,
  /^(?:Microsoft\s+Teams?|Skype\s+for\s+Business)\s*:/i,
];

function stripSignatureBlocks(text: string): string {
  const lines = text.split("\n");
  let cutLine = lines.length;
  let sigLineCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (SIGNATURE_TRIGGERS.some(p => p.test(line))) {
      sigLineCount++;
      if (sigLineCount === 1) cutLine = i;
    }
  }
  return lines.slice(0, cutLine).join("\n");
}

function removeMobileFooters(text: string): string {
  return text
    .replace(/Sent\s+from\s+my\s+(?:iPhone|Android|Samsung|BlackBerry|mobile)[^\n]*/gi, "")
    .replace(/Get\s+Outlook\s+for\s+(?:iOS|Android)[^\n]*/gi, "")
    .replace(/(?:www\.|http)[^\s]+/gi, "")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "");
}

function normalizeAbbreviations(text: string): string {
  return text
    .replace(/\bB\.?\s*SEA\b/gi, "BSEA")
    .replace(/\bM\.?\s*E\.?\s*D\.?\b/gi, "MED")
    .replace(/\bW\.?\s*AFR\b/gi, "WAFR")
    .replace(/\bE\.?\s*AFR\b/gi, "EAFR")
    .replace(/\bS\.?\s*CHINA\b/gi, "SCHINA")
    .replace(/\bN\.?\s*CHINA\b/gi, "NCHINA")
    .replace(/\bE\.?\s*C\.?\s*INDIA\b/gi, "ECI")
    .replace(/\bW\.?\s*C\.?\s*INDIA\b/gi, "WCI")
    .replace(/\bPCT\b/gi, "%")
    .replace(/\bTTL\b/gi, "TOTAL")
    .replace(/\bABT\b/gi, "ABT")
    .replace(/\bAPPROX\b/gi, "ABT")
    .replace(/\bMETRIC\s+TON(?:S)?\b/gi, "MT")
    .replace(/\bMETRIC\s+TONNES?\b/gi, "MT")
    .replace(/\bDEADWEIGHT\s+TON(?:S|NAGE)?\b/gi, "DWT")
    .replace(/\bTIME\s*CHARTER\b/gi, "TC")
    .replace(/\bVOYAGE\s*CHARTER\b/gi, "VC")
    .replace(/\bSUPRAMAX\b/gi, "SUPRAMAX")
    .replace(/\bULTRAMAX\b/gi, "ULTRAMAX")
    .replace(/\bPANAMAX\b/gi, "PANAMAX")
    .replace(/\bKAMSARMAX\b/gi, "KAMSARMAX")
    .replace(/\bCAPESIZE\b/gi, "CAPESIZE");
}

function normalizeEmailText(text: string): string {
  const cleaned = text
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/\u00a0/g, " ")
    // Apostrophe as thousands separator: 18'000 → 18,000 (common in French/EU broker formats)
    .replace(/(\d)'(\d{3})\b/g, "$1,$2")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");

  const abbrevNorm = normalizeAbbreviations(cleaned);

  return abbrevNorm
    .split("\n")
    .map(line => line.trim())
    .join("\n")
    .trim();
}

function preprocessEmail(text: string): string {
  let processed = normalizeEmailText(text);
  processed = removeMobileFooters(processed);
  // Do NOT strip signatures here — we still extract contact info from them
  return processed;
}

function compactForFallback(text: string): string {
  return normalizeEmailText(text).replace(/\n+/g, " ");
}

// ─── Date Parsing ─────────────────────────────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
  JAN: "01", JANUARY: "01", FEB: "02", FEBRUARY: "02", MAR: "03", MARCH: "03",
  APR: "04", APRIL: "04", MAY: "05", JUN: "06", JUNE: "06",
  JUL: "07", JULY: "07", AUG: "08", AUGUST: "08", SEP: "09", SEPTEMBER: "09",
  SEPT: "09", OCT: "10", OCTOBER: "10", NOV: "11", NOVEMBER: "11",
  DEC: "12", DECEMBER: "12",
};

function inferYear(monthNum: string): string {
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const targetMonth = parseInt(monthNum, 10);
  // If target month is already past this year, use next year
  if (targetMonth < curMonth - 1) return (curYear + 1).toString();
  return curYear.toString();
}

function parseLaycan(text: string): { start: string | null; end: string | null } {
  const upper = text.toUpperCase().trim();

  // SPOT / PROMPT / ASAP
  if (/\b(?:SPOT|PROMPT|ASAP|IMMEDIATELY)\b/.test(upper)) {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const end = new Date(today); end.setDate(end.getDate() + 5);
    return { start: fmt(today), end: fmt(end) };
  }

  // Q1/Q2/Q3/Q4 2025 format
  const quarterMatch = upper.match(/\bQ([1-4])\s*[,.\s]*(\d{4})\b/);
  if (quarterMatch) {
    const q = parseInt(quarterMatch[1]);
    const yr = quarterMatch[2];
    const startMonth = ((q - 1) * 3 + 1).toString().padStart(2, "0");
    const endMonthNum = q * 3;
    const lastDay = new Date(parseInt(yr), endMonthNum, 0).getDate();
    const endMonth = endMonthNum.toString().padStart(2, "0");
    return { start: `${yr}-${startMonth}-01`, end: `${yr}-${endMonth}-${lastDay}` };
  }

  // H1/H2 2025 format (first half / second half)
  const halfMatch = upper.match(/\bH([12])\s*[,.\s]*(\d{4})\b/);
  if (halfMatch) {
    const h = parseInt(halfMatch[1]);
    const yr = halfMatch[2];
    const startMonth = h === 1 ? "01" : "07";
    const endMonthNum = h === 1 ? 6 : 12;
    const lastDay = new Date(parseInt(yr), endMonthNum, 0).getDate();
    const endMonth = endMonthNum.toString().padStart(2, "0");
    return { start: `${yr}-${startMonth}-01`, end: `${yr}-${endMonth}-${lastDay}` };
  }

  // "18th - 20th JULY, 2025" or "16-21 OCT 2025"
  const rangeMatch = upper.match(/(\d{1,2})(?:ST|ND|RD|TH)?\s*[-–\/]\s*(\d{1,2})(?:ST|ND|RD|TH)?\s+([A-Z]+)[,.\s]+(\d{4})/);
  if (rangeMatch) {
    const [, d1, d2, mon, yr] = rangeMatch;
    const m = MONTH_MAP[mon];
    if (m) {
      const start = `${yr}-${m}-${d1.padStart(2, "0")}`;
      const end = `${yr}-${m}-${d2.padStart(2, "0")}`;
      return fixDatesAsLaycan(start, end);
    }
  }

  // "16-21 OCT" — no year
  const rangeNoYear = upper.match(/(\d{1,2})(?:ST|ND|RD|TH)?\s*[-–]\s*(\d{1,2})(?:ST|ND|RD|TH)?\s+([A-Z]+)\s*$/);
  if (rangeNoYear) {
    const [, d1, d2, mon] = rangeNoYear;
    const m = MONTH_MAP[mon];
    if (m) {
      const yr = inferYear(m);
      const start = `${yr}-${m}-${d1.padStart(2, "0")}`;
      const end = `${yr}-${m}-${d2.padStart(2, "0")}`;
      return fixDatesAsLaycan(start, end);
    }
  }

  // "END OF JULY ONWARDS" / "END JULY 2025"
  const endMonthOnwardsMatch = upper.match(/(?:END\s+OF|END|LATE)\s+([A-Z]+)(?:[,.\s]+(\d{4}))?\s*(?:ONWARDS|ONWARD)?/);
  if (endMonthOnwardsMatch) {
    const [, mon, yr] = endMonthOnwardsMatch;
    const m = MONTH_MAP[mon];
    if (m) {
      const year = yr ?? inferYear(m);
      const lastDay = new Date(parseInt(year), parseInt(m), 0).getDate();
      const start = `${year}-${m}-${(lastDay - 5).toString().padStart(2, "0")}`;
      const end = `${year}-${m}-${lastDay.toString().padStart(2, "0")}`;
      return { start, end };
    }
  }

  // "EARLY JULY 2025" / "MID AUGUST" / "BEGINNING OF JULY"
  const midEarlyMatch = upper.match(/(?:EARLY|MID(?:DLE)?|BEGINNING\s+OF|FIRST\s+HALF\s+OF|SECOND\s+HALF\s+OF)\s+([A-Z]+)(?:[,.\s]+(\d{4}))?/);
  if (midEarlyMatch) {
    const [fullMatch, mon, yr] = midEarlyMatch;
    const m = MONTH_MAP[mon];
    if (m) {
      const year = yr ?? inferYear(m);
      const isEarly = /EARLY|BEGINNING|FIRST/.test(fullMatch);
      const isMid = /MID/.test(fullMatch);
      const prefix = isEarly ? "01" : isMid ? "10" : "20";
      const endDay = isEarly ? "10" : isMid ? "20" : "28";
      return { start: `${year}-${m}-${prefix}`, end: `${year}-${m}-${endDay}` };
    }
  }

  // "20 JULY ONWARDS" / "20 JULY 2025 ONWARDS"
  const onwardsMatch = upper.match(/(\d{1,2})(?:ST|ND|RD|TH)?\s+([A-Z]+)(?:[,.\s]+(\d{4}))?\s+(?:ONWARDS|ONWARD)/);
  if (onwardsMatch) {
    const [, d, mon, yr] = onwardsMatch;
    const m = MONTH_MAP[mon];
    if (m) {
      const year = yr ?? inferYear(m);
      const start = `${year}-${m}-${d.padStart(2, "0")}`;
      const endTs = new Date(start).getTime() + 5 * 86400000;
      const end = new Date(endTs).toISOString().split("T")[0];
      return { start, end };
    }
  }

  // "22ND JULY 2025" — single date with year
  const singleDate = upper.match(/(\d{1,2})(?:ST|ND|RD|TH)?\s+([A-Z]+)[,.\s]+(\d{4})/);
  if (singleDate) {
    const [, d, mon, yr] = singleDate;
    const m = MONTH_MAP[mon];
    if (m) {
      const start = `${yr}-${m}-${d.padStart(2, "0")}`;
      const endTs = new Date(start).getTime() + 5 * 86400000;
      const end = new Date(endTs).toISOString().split("T")[0];
      return { start, end };
    }
  }

  // "22 JULY" — single date without year
  const singleDateNoYear = upper.match(/(\d{1,2})(?:ST|ND|RD|TH)?\s+([A-Z]+)\s*$/);
  if (singleDateNoYear) {
    const [, d, mon] = singleDateNoYear;
    const m = MONTH_MAP[mon];
    if (m) {
      const yr = inferYear(m);
      const start = `${yr}-${m}-${d.padStart(2, "0")}`;
      const endTs = new Date(start).getTime() + 5 * 86400000;
      const end = new Date(endTs).toISOString().split("T")[0];
      return { start, end };
    }
  }

  // "JULY 2025" — whole month
  const monthOnly = upper.match(/\b([A-Z]+)[,\s]+(\d{4})\b/);
  if (monthOnly) {
    const [, mon, yr] = monthOnly;
    const m = MONTH_MAP[mon];
    if (m) {
      const lastDay = new Date(parseInt(yr), parseInt(m), 0).getDate();
      return { start: `${yr}-${m}-01`, end: `${yr}-${m}-${lastDay}` };
    }
  }

  // "JULY" alone — infer year
  const monthOnlyNoYear = upper.match(/^([A-Z]{3,9})\s*$/);
  if (monthOnlyNoYear) {
    const m = MONTH_MAP[monthOnlyNoYear[1]];
    if (m) {
      const yr = inferYear(m);
      const lastDay = new Date(parseInt(yr), parseInt(m), 0).getDate();
      return { start: `${yr}-${m}-01`, end: `${yr}-${m}-${lastDay}` };
    }
  }

  return { start: null, end: null };
}

function fixDatesAsLaycan(start: string, end: string): { start: string; end: string | null } {
  const r = fixDates(start, end);
  return { start: r.open, end: r.close || null };
}

function parseDwt(text: string): { min: number | null; max: number | null; vesselType: string | null } {
  const upper = text.toUpperCase();

  // DWT as label prefix: "DWT: 52,000 - 58,000" or "DWT: 52,000"
  const labelPrefixRange = upper.match(/(?:DWT|DEADWEIGHT)\s*[:\s]+(\d{1,3}(?:[.,]\d{3})?)(K?)\s*[-–TO]+\s*(\d{1,3}(?:[.,]\d{3})?)(K?)/);
  if (labelPrefixRange) {
    const [, v1, k1, v2, k2] = labelPrefixRange;
    const f1 = k1 ? 1000 : 1;
    const f2 = k2 ? 1000 : 1;
    const minVal = parseFloat(v1.replace(/[,.]/g, "")) * f1;
    const maxVal = parseFloat(v2.replace(/[,.]/g, "")) * f2;
    if (minVal >= 1000 && maxVal >= 1000) return { min: minVal, max: maxVal, vesselType: null };
  }
  const labelPrefixSingle = upper.match(/(?:DWT|DEADWEIGHT)\s*[:\s]+(\d{1,3}(?:[.,]\d{3})?)(K?)\s*(?:DWT|MT|$)/);
  if (labelPrefixSingle) {
    const [, v, k] = labelPrefixSingle;
    const f = k ? 1000 : 1;
    const val = parseFloat(v.replace(/[,.]/g, "")) * f;
    if (val >= 1000) return { min: val, max: val, vesselType: null };
  }

  // Explicit DWT range (value before keyword)
  const rangeMatch = upper.match(/(\d{1,3}(?:[.,]\d{3})?)(K?)\s*[-–]\s*(\d{1,3}(?:[.,]\d{3})?)(K?)\s*(?:DWT|DEADWEIGHT)/);
  if (rangeMatch) {
    const [, v1, k1, v2, k2] = rangeMatch;
    const f1 = k1 ? 1000 : 1;
    const f2 = k2 ? 1000 : 1;
    const minVal = parseFloat(v1.replace(/[,.]/g, "")) * f1;
    const maxVal = parseFloat(v2.replace(/[,.]/g, "")) * f2;
    if (minVal >= 1000 && maxVal >= 1000) return { min: minVal, max: maxVal, vesselType: null };
  }

  // Explicit single DWT (value before keyword)
  const singleMatch = upper.match(/(\d{1,3}(?:[.,]\d{3})?)(K?)\s*(?:DWT|DEADWEIGHT)/);
  if (singleMatch) {
    const [, v, k] = singleMatch;
    const f = k ? 1000 : 1;
    const val = parseFloat(v.replace(/[,.]/g, "")) * f;
    if (val >= 1000) return { min: val, max: val, vesselType: null };
  }

  // SIZE: / VESSEL SIZE: range without DWT keyword — e.g. "SIZE: 52,000 - 58,000"
  const sizeRangeMatch = upper.match(/(?:SIZE|VESSEL\s*SIZE|VESSEL\s*REQUIREMENT|TONNAGE)\s*[:\s]+.*?(\d{2,3}(?:[.,]\d{3})?)(K?)\s*[-–]\s*(\d{2,3}(?:[.,]\d{3})?)(K?)\b/);
  if (sizeRangeMatch) {
    const [, v1, k1, v2, k2] = sizeRangeMatch;
    const f1 = k1 ? 1000 : 1;
    const f2 = k2 ? 1000 : 1;
    const minVal = parseFloat(v1.replace(/[,.]/g, "")) * f1;
    const maxVal = parseFloat(v2.replace(/[,.]/g, "")) * f2;
    if (minVal >= 10000 && maxVal >= 10000) return { min: minVal, max: maxVal, vesselType: null };
  }

  // Vessel class names — longest match first
  const sortedSizes = Object.entries(VESSEL_SIZE_MAP).sort((a, b) => b[0].length - a[0].length);
  const foundClasses: Array<{ min: number; max: number; type: string }> = [];

  for (const [name, range] of sortedSizes) {
    if (new RegExp(`\\b${name}\\b`, "i").test(upper)) {
      foundClasses.push(range);
    }
  }

  if (foundClasses.length > 0) {
    const minVal = Math.min(...foundClasses.map(c => c.min));
    const maxVal = Math.max(...foundClasses.map(c => c.max));
    const vesselType = foundClasses[0].type;
    return { min: minVal, max: maxVal, vesselType };
  }

  return { min: null, max: null, vesselType: null };
}

function parseQuantity(text: string): { min: number | null; max: number | null } {
  const upper = text.toUpperCase();
  // Remove rate lines like "15,000 MT/DAY" or "20,000 PDPR" to avoid false matches
  const noRates = upper
    .replace(/\d[\d,.\s]*\s*(?:MTS?|METRIC\s*TONS?)\s*\/?\s*(?:DAY|PDPR?|PMD|PDPW|SHINC|SHEX|PWWD)[^\n]*/g, "")
    .replace(/\d[\d,.\s]*\s*(?:MT\/D|MT\/DAY)[^\n]*/g, "");

  // Range like "50,000 - 55,000 MT"
  const rangeMatch = noRates.match(/(\d{1,3}(?:[,.\s]\d{3})*)\s*[-–]\s*(\d{1,3}(?:[,.\s]\d{3})*)\s*(?:MTS?|METRIC\s*TONS?)/);
  if (rangeMatch) {
    return {
      min: parseInt(rangeMatch[1].replace(/[,.\s]/g, "")),
      max: parseInt(rangeMatch[2].replace(/[,.\s]/g, "")),
    };
  }
  // M/M pattern like "55,000 MT MOLOO"
  const mmMatch = noRates.match(/\b(\d{1,3}(?:[,.\s]\d{3})*)\s*(?:MTS?|METRIC\s*TONS?)\s*(?:MOLOO|MOLCO|CHOPT|[\+\/])/);
  if (mmMatch) {
    const val = parseInt(mmMatch[1].replace(/[,.\s]/g, ""));
    if (val >= 1000) return { min: val, max: val };
  }
  const plainSingle = noRates.match(/\b(\d{4,6})\s*(?:MTS?|METRIC\s*TONS?)\b/);
  if (plainSingle) {
    const val = parseInt(plainSingle[1], 10);
    return { min: val, max: val };
  }
  const singleMatch = noRates.match(/\b(\d{1,3}(?:[,.\s]\d{3})*)\s*(?:MTS?|METRIC\s*TONS?)/);
  if (singleMatch) {
    const val = parseInt(singleMatch[1].replace(/[,.\s]/g, ""));
    if (val >= 1000) return { min: val, max: val };
  }
  return { min: null, max: null };
}

function extractSignature(text: string): { pic: string | null; email: string | null; phone: string | null } {
  const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
  const email = emails ? emails[0] : null;

  let phone: string | null = null;
  const phoneRegex = /(?:Mobile|Phone|WhatsApp|Contact|Tel|Mob)\s*[/\s:]*(\+?[\d][\d\s\-().+]{7,24})/gi;
  let phoneMatch;
  while ((phoneMatch = phoneRegex.exec(text)) !== null) {
    const candidate = phoneMatch[1].trim();
    if (isValidPhone(candidate)) { phone = candidate; break; }
  }

  const lines = text.split("\n");
  let pic: string | null = null;
  for (const line of lines) {
    const t = line.trim();
    if (t.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/) && t.split(" ").length <= 3) {
      pic = t;
      break;
    }
  }

  return { pic, email, phone };
}

function resolveRegion(text: string): string | null {
  const upper = text.toUpperCase();
  const entries = Object.entries(REGION_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [abbrev, full] of entries) {
    const escaped = abbrev.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`).test(upper)) return full;
  }
  return null;
}

function resolvePort(text: string): string {
  const upper = text.trim().toUpperCase();
  return PORT_ABBREVS[upper] ?? text.trim();
}

function cleanBrokerLocation(text: string | null): string | null {
  if (!text) return null;
  const cleaned = text
    .replace(/\b\d+\s*(?:SP|P|SB|PORTS?)\b/gi, " ")
    .replace(/\b(?:LOAD(?:ING)?|DISCH(?:ARGE)?|DEL(?:IVERY)?|REDEL(?:IVERY)?|PORT|AREA|RANGE)\b/gi, " ")
    .replace(/\b(?:INTENTION|INTENT|ABT|ABOUT|CHOPT|OO|DLOSP|APS|AFS|TIP)\b/gi, " ")
    .replace(/[()*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || cleaned.length <= 2) return null;
  return cleaned;
}

function extractRoutePorts(text: string): { load: string | null; discharge: string | null } {
  const normalized = compactForFallback(text);
  const slashRoute =
    normalized.match(/\b\d+\s*(?:SP|P)?\s+([A-Z][A-Z0-9 .'-]+?)\s*\/\s*\d+\s*(?:SP|P)?\s+([A-Z][A-Z0-9 .'-]+?)(?=\s+(?:\d{4,6}\s*MT|LAYCAN|LC|CARGO|COMM|ADCOM)|$)/i) ||
    normalized.match(/\bFROM\s+([A-Z][A-Z0-9 .'-]+?)\s+(?:TO|\/)\s+([A-Z][A-Z0-9 .'-]+?)(?:\s{2,}| LAYCAN| LC | CARGO| COMM|$)/i);

  if (slashRoute) {
    return {
      load: cleanBrokerLocation(slashRoute[1]),
      discharge: cleanBrokerLocation(slashRoute[2]),
    };
  }

  // Try "PORT A / PORT B" without SP notation
  const simplePorts = normalized.match(/\b([A-Z]{3,})\s*\/\s*([A-Z]{3,})\b(?!\s*(?:DWT|MT|KT))/);
  if (simplePorts) {
    const load = simplePorts[1];
    const discharge = simplePorts[2];
    if (isValidPort(load) && isValidPort(discharge) && !REGION_MAP[load] && !REGION_MAP[discharge]) {
      return { load: resolvePort(load), discharge: resolvePort(discharge) };
    }
  }

  return { load: null, discharge: null };
}

function detectCargoType(text: string): string {
  const upper = text.toUpperCase();
  for (const [keyword, type] of Object.entries(CARGO_TYPE_MAP)) {
    if (upper.includes(keyword)) return type;
  }
  return "Dry Bulk";
}

function normalizeCargo(raw: string): string {
  const upper = raw.toUpperCase().trim();
  return CARGO_ALIASES[upper] ?? raw.trim();
}

function cleanCargoName(raw: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw
    // Combined commodities: SLAG+CLINKER → SLAG/CLINKER
    .replace(/\s*\+\s*/g, "/")
    // Strip quantity prefix if present: "55,000 MT COAL" → "COAL"
    .replace(/^\d[\d,.\s]*\s*(?:MT|MTS|METRIC\s*TONS?)\s*/i, "")
    // Strip known noise suffixes
    .replace(/\b(?:IN\s+)?BULK\b.*$/i, "")
    .replace(/\bSF\s*\d+(?:\.\d+)?\b.*$/i, "")
    .replace(/\b\d{1,2}\s*%.*$/i, "")
    .replace(/\b\d{1,2}\s*PCT.*$/i, "")
    .replace(/\b(?:TOTAL|MOLOO|MOLCO|CHOPT|LOAD|DISCH|LINER|TERMS|TTL)\b.*$/i, "")
    // Strip noise prefixes/words
    .replace(/^(?:OF|IN|WITH|FOR)\s+/i, "")
    .replace(/\bUPRIVER\b/gi, "")
    .replace(/\bTRIP\s+WITH\b/gi, "")
    .replace(/\bARGENTINA\b/gi, "")
    .replace(/\bMTS?\b/gi, "")
    // Normalize OR to slash
    .replace(/\s+OR\s+/gi, "/")
    .replace(/\s+/g, " ")
    .trim();

  if (/^\d/.test(cleaned) || /\b\d+\s*(?:SP|P)\b/i.test(cleaned)) return null;
  if (!cleaned || cleaned.length < 3 || !isValidCargo(cleaned)) return null;
  return normalizeCargo(cleaned);
}

function extractCargoName(segment: string): string | null {
  // Explicit CARGO / COMMODITY label — COLON REQUIRED to avoid "cargo inquiry" / "cargo position" false matches
  const explicit =
    segment.match(/(?:CARGO|COMMODITY|COMMODIT)\s*:\s*([^\n\-–*]+)/i) ||
    segment.match(/\d\s+TCT\s+(?:WITH\s+)?([A-Z][A-Z\s\/OR+]+?)\s+IN\s+BLK/i) ||
    segment.match(/TCT\s+(?:WITH\s+)?([A-Z][A-Z\s\/OR+]+?)\s+IN\s+BLK/i) ||
    segment.match(/(?:CARRYING|LADEN\s+WITH|LOAD(?:ING)?)\s*:\s*([A-Z][A-Z\s\/+]+?)(?:\s+IN|\s+AT|\s+FROM|\s+TO|[,\n])/i);

  if (explicit) {
    const cargo = cleanCargoName(explicit[1].trim().split("\n")[0]);
    if (cargo) return cargo;
  }

  // Label on next line
  const lines = segment.split("\n").map(line => line.trim()).filter(Boolean);
  for (let i = 0; i < lines.length - 1; i++) {
    if (/^(?:CARGO|COMMODITY|COMMODIT)\s*:?\s*$/i.test(lines[i])) {
      const cargo = cleanCargoName(lines[i + 1]);
      if (cargo) return cargo;
    }
  }

  // Inline: "55,000 MT COAL IN BULK" or "55,000 MT COAL LAYCAN..." pattern
  const compact = compactForFallback(segment);
  const inlineCargo =
    compact.match(/\b\d{1,3}[,\s]\d{3}\s*(?:MT|MTS)\s+(?:\d{1,2}\s*%|MOLOO|MOLCO|CHOPT|TTL|TOTAL)?\s*([A-Z][A-Z+]{2,30})\s+(?:IN\s+BULK|LAYCAN|LC\b|CARGO|LOAD|DISCH)/i) ||
    compact.match(/\b\d{4,6}\s*(?:MT|MTS|METRIC\s+TONS?)\s+(?:\d{1,2}\s*%|MOLOO|MOLCO|CHOPT|TTL|TOTAL)?[\s\/]*([A-Z][A-Z +/-]{2,40}?)\s+(?:IN\s+)?BULK\b/i) ||
    compact.match(/\b([A-Z][A-Z +/-]{2,40}?)\s+(?:IN\s+)?BULK\b/i);

  if (inlineCargo) {
    const cargo = cleanCargoName(inlineCargo[1]);
    if (cargo) return cargo;
  }

  // Compact broker shorthand: "15-18,000 mt urea" or "30,000 mt coal lp vizag"
  // Detect commodity following a quantity+MT pattern
  const KNOWN_COMMODITIES = /^(UREA|COAL|FERTS?|CLINKER|SLAG|MAIZE|CORN|WHEAT|BARLEY|RICE|PETCOKE|LIMESTONE|BAUXITE|SOYA|SOYBEANS?|GRAIN|SUGAR|SULPHUR|POTASH|PHOSPHATE|GYPSUM|DAP|MOP|NPK|SALT|FERTILIZ\w*|IRON\s*ORE|IRON\s*PELLETS?|COPPER\s*CONC\w*|MANGANESE|NICKEL\s*ORE|CHROME\s*ORE|STEEL\s*\w+|SALT|SAND)(\s*[+/]\s*\w+)?$/i;
  const compactCommodity = compact.match(/\b(\d{1,3}[-–]\d{1,3}[,]\d{3}|\d{1,3}[,]\d{3}|\d{4,6})\s*(?:MT|MTS|MTONS?)\s+([A-Z][A-Z+ /]{2,30}?)(?:\s+(?:LP|DP|LOAD|DISCH|LAYCAN|LC|FROM|TO)|,|\s{2,}|$)/i);
  if (compactCommodity) {
    const rawCargo = compactCommodity[2].trim();
    if (KNOWN_COMMODITIES.test(rawCargo)) {
      const cargo = cleanCargoName(rawCargo);
      if (cargo) return cargo;
    }
  }

  return null;
}

function parseDuration(text: string): string | null {
  const wogMatch =
    text.match(
        /ABT\s+(\d+)\s+(?:DAYS?|DYS?)\s+WOG/i
    );

if (wogMatch) {
    return `${wogMatch[1]} days`;
}

const mosMatch =
    text.match(
        /UPTO\s+(\d+)\s*\/\s*(\d+)\s+MOS?/i
    );

if (mosMatch) {
    return `${mosMatch[1]}/${mosMatch[2]} months`;
}
  const uptoMatch =
    text.match(
      /UPTO\s+(\d+)\s*\/\s*(\d+)\s*(MOS?|MONTHS?)/i
    );

  if (uptoMatch) {
    return `${uptoMatch[1]}/${uptoMatch[2]} MOS`;
  }

  const rangeMatch = text.match(
    /(?:ABT\s+)?(\d+)\s*(?:TO|[-–])\s*(\d+)\s*(DAYS?|MONTHS?|YEARS?|YRS?|MOS?)?/i
  );

  if (rangeMatch) {

    const [, min, max, unit = "DAYS"] = rangeMatch;

    const u = unit.toUpperCase();

    const unitStr =
      u.startsWith("MONTH") || u.startsWith("MO")
      ? "months"
      : u.startsWith("YEAR") || u.startsWith("YR")
      ? "years"
      : "days";

    return `${min}-${max} ${unitStr}`;
  }

  const singleMatch =
    text.match(
      /(?:ABT\s+)?(\d+)\s*(DAYS?|MONTHS?|YEARS?|YRS?|MOS?)/i
    );

  if (singleMatch) {

    const [, val, unit] = singleMatch;

    const u = unit.toUpperCase();

    const unitStr =
      u.startsWith("MONTH") || u.startsWith("MO")
      ? "months"
      : u.startsWith("YEAR") || u.startsWith("YR")
      ? "years"
      : "days";

    return `${val} ${unitStr}`;
  }

  return null;
}

// ─── Compact Rate Parser ──────────────────────────────────────────────────────
// Handles broker shorthand: "4000x/2000x", "10000shex/6000shinc", "15000/12000"

function parseCompactRates(text: string): { loadRate: string | null; dischargeRate: string | null } {
  const compact = compactForFallback(text).toUpperCase();

  // Pattern: <load_rate><term?>/<discharge_rate><term?> — rates 500-100000 MT/DAY
  // e.g. "4000X/2000X", "10000SHEX/6000SHINC", "8000/6000", "15000FHEX/12000SHINC"
  const ratePattern = /\b(\d{3,6})\s*(X|SHINC|SHEX|FHEX|FIOST|FILO|FIOS|CQD|PWWD|PMD|PDPR)?\s*\/\s*(\d{3,6})\s*(X|SHINC|SHEX|FHEX|FIOST|FILO|FIOS|CQD|PWWD|PMD|PDPR)?(?=\s|,|$|\s+MT)/i;
  const match = compact.match(ratePattern);
  if (match) {
    const loadVal = parseInt(match[1]);
    const loadTerm = match[2] && match[2] !== "X" ? ` ${match[2]}` : "";
    const dischVal = parseInt(match[3]);
    const dischTerm = match[4] && match[4] !== "X" ? ` ${match[4]}` : "";
    // Guard: plausible cargo rates 500–100,000 MT/DAY, and not a date or quantity
    if (loadVal >= 500 && loadVal <= 100000 && dischVal >= 500 && dischVal <= 100000) {
      return {
        loadRate: `${loadVal}${loadTerm} MT/DAY`,
        dischargeRate: `${dischVal}${dischTerm} MT/DAY`,
      };
    }
  }

  return { loadRate: null, dischargeRate: null };
}

// ─── Multi-Port Resolver ──────────────────────────────────────────────────────
// Handles "Iskenderun or Durban", "HAZIRA & MUMBAI", "1/2 SPSB MUMBAI"

function resolveMultiPort(raw: string | null): string | null {
  if (!raw) return null;
  // Strip SP/SPSB notation (safe port/safe berth counts)
  const noSpsb = raw
    .replace(/\b\d+\s*(?:SPSB|SB|SP)\b/gi, "")
    .replace(/\s+/g, " ").trim();

  // Split on OR / AND / &
  const parts = noSpsb.split(/\s+(?:OR|AND|&)\s+/i).map(p => p.trim()).filter(Boolean);

  if (parts.length > 1) {
    const resolved = parts
      .map(p => {
        const clean = cleanBrokerLocation(p);
        return clean && isValidPort(clean) ? resolvePort(clean) : null;
      })
      .filter(Boolean) as string[];
    if (resolved.length > 0) return resolved.join(" / ");
  }

  // Single port — use standard cleanup
  const clean = cleanBrokerLocation(noSpsb);
  if (!clean || !isValidPort(clean)) return null;
  return resolvePort(clean);
}

function extractCommonTechnicalFields(segment: string): Partial<ExtractedFields> {
  const fields: Partial<ExtractedFields> = {};

  const imoMatch = segment.match(PATTERNS.imo);
  if (imoMatch) fields.imo = imoMatch[1];

  const grtMatch = segment.match(PATTERNS.grt);
  if (grtMatch) {
    const v = parseInt(grtMatch[1].replace(/[,.\s]/g, ""));
    if (!isNaN(v) && v > 100) fields.grt = v.toString();
  }

  const nrtMatch = segment.match(PATTERNS.nrt);
  if (nrtMatch) {
    const v = parseInt(nrtMatch[1].replace(/[,.\s]/g, ""));
    if (!isNaN(v) && v > 100) fields.nrt = v.toString();
  }

  const loaMatch = segment.match(PATTERNS.loa);
  if (loaMatch) {
    const v = parseFloat(loaMatch[1].replace(",", "."));
    if (!isNaN(v) && v > 10) fields.loa = `${v}m`;
  }

  const beamMatch = segment.match(PATTERNS.beam);
  if (beamMatch) {
    const v = parseFloat(beamMatch[1].replace(",", "."));
    if (!isNaN(v) && v > 5) fields.beam = `${v}m`;
  }

  const grainMatch = segment.match(PATTERNS.grainCap);
  if (grainMatch) {
    const v = parseInt(grainMatch[1].replace(/[,.\s]/g, ""));
    if (!isNaN(v) && v > 1000) fields.grain_capacity = v.toString();
  }

  // Commission
  const commMatch = segment.match(PATTERNS.commission) ||
    segment.match(PATTERNS.commissionReverse) ||
    segment.match(/(\d+(?:\.\d+)?)\s+(?:ADDCOM|ADCOM)(?:\s+(?:TTL|TOTAL))?/i);
  if (commMatch) fields.commission = `${commMatch[1]}%`;

  // Load rate
  const loadRateMatch = segment.match(PATTERNS.loadRate);
  if (loadRateMatch) {
    const v = parseInt(loadRateMatch[1].replace(/,/g, ""));
    if (!isNaN(v) && v > 100) fields.load_rate = `${v} MT/DAY`;
  }

  // Discharge rate
  const dischargeRateMatch = segment.match(PATTERNS.dischargeRate);
  if (dischargeRateMatch) {
    const v = parseInt(dischargeRateMatch[1].replace(/,/g, ""));
    if (!isNaN(v) && v > 100) fields.discharge_rate = `${v} MT/DAY`;
  }

  // Hire rate (TC)
  const hireMatch = segment.match(PATTERNS.hireRate);
  if (hireMatch) {
    const v = parseInt(hireMatch[1].replace(/,/g, ""));
    if (!isNaN(v) && v >= 1000 && v <= 200000) fields.hire_rate = `USD ${v}/DAY`;
  }

  // Built year — handles both "BUILT: 2012" and "2015 BLT"
  const builtMatch = segment.match(PATTERNS.builtYear);
  if (builtMatch) {
    const rawYr = builtMatch[1] ?? builtMatch[2];
    const yr = parseInt(rawYr, 10);
    if (yr >= 1970 && yr <= new Date().getFullYear() + 1) fields.built_year = rawYr;
  }

  // Flag
  const flagMatch = segment.match(PATTERNS.flag);
  if (flagMatch) fields.flag = flagMatch[1].trim();

  // Compact rate format fallback: "4000x/2000x", "10000shex/6000shinc"
  // Only apply when explicit rate patterns didn't fire
  if (!fields.load_rate || !fields.discharge_rate) {
    const { loadRate, dischargeRate } = parseCompactRates(segment);
    if (!fields.load_rate && loadRate) fields.load_rate = loadRate;
    if (!fields.discharge_rate && dischargeRate) fields.discharge_rate = dischargeRate;
  }

  return fields;
}

// ─── Email Segmentation v2 ────────────────────────────────────────────────────

// Separator patterns: explicit dividers in broker circulars
const HARD_SEPARATORS = /\n[-─—*=]{4,}\n/g;

// Patterns that strongly indicate start of a new cargo/tonnage block
function startsNewBlock(line: string): boolean {
  const t = line.trim().toUpperCase();
  if (t.length < 5) return false;

  // Numbered bullets: "1." "1)" "A." "A)"
  if (/^\d+\.\s+/.test(t)) {
    return true;
}

if (/^\d+\)\s+/.test(t)) {
    return true;
}

if (/^[A-Z]\.\s+/.test(t)) {
    return true;
}

if (/^[A-Z]\)\s+/.test(t)) {
    return true;
}

  // ACCT line (TC circular)
  if (/^ACCT\s+/.test(t)) return true;

  // A/C line
  if (/^A\/C\s+/.test(t)) return true;

  // MV / M/V vessel name
  if (/^M[TV]\/?\s+[A-Z]/.test(t)) return true;

  // VESSEL: or TONNAGE: — but NOT VESSEL TYPE:, VESSEL POSITION:, etc. (those are field labels not entry headers)
  if (/^VESSEL\s*(?:NAME|DETAILS|OFFER|DESCRIPTION)?\s*:/.test(t)) return true;
  if (/^TONNAGE\s*(?:POSITION|DETAILS|OFFER)?[:\s]/.test(t)) return true;

  // Forwarded email separator
  if (/^[-]{3,}\s*(?:Forwarded|Original)\s+(?:message|Message|Msg)/i.test(line)) return true;

  return false;
}

function splitByAcCt(text: string): string[] {
  const lines = text.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];
  let blockCount = 0;

  for (const line of lines) {
    const t = line.trim().toUpperCase();
    const isBlockStart = /^(?:ACCT|A\/C)\s+/.test(t);

    if (isBlockStart && blockCount > 0 && current.join("").trim().length > 20) {
      blocks.push(current.join("\n").trim());
      current = [];
    }
    if (isBlockStart) blockCount++;
    current.push(line);
  }
  if (current.join("").trim().length > 20) blocks.push(current.join("\n").trim());
  return blocks.length > 1 ? blocks : [text];
}

function splitByBullets(text: string): string[] {
  const lines = text.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];
  let blockCount = 0;

  for (const line of lines) {
    if (startsNewBlock(line) && blockCount > 0 && current.join("").trim().length > 30) {
      blocks.push(current.join("\n").trim());
      current = [];
    }
    if (startsNewBlock(line)) blockCount++;
    current.push(line);
  }
  if (current.join("").trim().length > 30) blocks.push(current.join("\n").trim());
  return blocks.length > 1 ? blocks : [];
}

function splitForwardedChains(text: string): string[] {
  // Split at "--- Forwarded message ---" or "--- Original Message ---"
  const parts = text.split(/\n[-]{3,}\s*(?:Forwarded|Original)\s+(?:message|Message|Msg).*?\n/i);
  return parts.map(p => p.trim()).filter(p => p.length > 50);
}

function segmentEmail(emailText: string): string[] {
  const normalizedText = normalizeEmailText(emailText);
  const result: string[] = [];

  // Step 1: Split forwarded email chains
  const forwardedParts = splitForwardedChains(normalizedText);
  const workingParts = forwardedParts.length > 1 ? forwardedParts : [normalizedText];

  for (const part of workingParts) {
    // Step 2: Split on hard dash separators
    const hardSplit = part.split(HARD_SEPARATORS);

    for (const seg of hardSplit) {
      const trimmed = seg.trim();
      if (trimmed.length < 20) continue;

      // Step 3: Check for ACCT/A/C multi-block pattern
      const acctCount = (trimmed.match(/^(?:ACCT|A\/C)\s+/gim) ?? []).length;
      if (acctCount >= 2) {
        result.push(...splitByAcCt(trimmed));
        continue;
      }

      // Step 4: Check for bullet / numbered block pattern
      const bulletBlocks = splitByBullets(trimmed);
      if (bulletBlocks.length > 1) {
        result.push(...bulletBlocks);
        continue;
      }

      result.push(trimmed);
    }
  }

  // Deduplicate
  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const segment of result.filter(s => s.length > 20)) {
    const key = segment.replace(/\s+/g, " ").slice(0, 500).toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(segment);
    }
  }

  return deduped.length > 0 ? deduped : [normalizedText];
}

// ─── Type Detection ───────────────────────────────────────────────────────────

function detectSegmentType(segment: string): EntryType | null {
  const upper = segment.toUpperCase();
  const compact = compactForFallback(segment).toUpperCase();

  const hasTCSignals =
    /(?:DELY?|DEL|DELIVERY)\s*[:\s*]+|(?:REDELY?|REDEL|RE-DELY?)\s*[:\s*]+|TCT\b|TIME\s*CHARTER|1\s*TCT|\bTRIP\b|\bPERIOD\b|\bDURATION\b|\bHIRE\b/.test(upper);

  // hasVCSignals: detect comma-formatted MT numbers too e.g. "55,000 MT"
  // Also detect commodity+quantity patterns (broker shorthand: "15,000 mt urea")
  const BULK_COMMODITY_PATTERN = /\b(?:UREA|FERTS?|FERTILIZ|FERTILISERS?|COAL|CLINKER|SLAG|MAIZE|CORN|WHEAT|BARLEY|RICE|PETCOKE|LIMESTONE|BAUXITE|SOYA|SOYBEAN|GRAIN|SUGAR|SULPHUR|POTASH|PHOSPHATE|GYPSUM|DAP|MOP|NPK|SALT)\b/i;
  const hasVCSignals =
  /(?:LP|LOADING\s*PORT?|POL|POD|DISCHARGE\s*PORT)\s*[:\s]+|VOYAGE\s*CHARTER|LOAD\s*RATE|DISRATE|DISCHARGING\s*RATE|\b\d{4,6}\s*MT\b|\bMTS\b|\bIN\s+BULK\b|\b\d+(?:\.\d+)?K\b|\b\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?K\b|\bSF\s*\d/i.test(upper)
  ||
  /\b\d{1,3}[,]\d{3}\s*MT\b/.test(upper)
  ||
  /\b\d+\s*(?:SP|P)?\s+[A-Z][A-Z0-9 .'-]+?\s*\/\s*\d+\s*(?:SP|P)?\s+[A-Z][A-Z0-9 .'-]+/.test(compact)
  ||
  (
    BULK_COMMODITY_PATTERN.test(upper)
    &&
    (
      /\b\d{4,6}\s*(?:MT|MTS|MTONS)\b/i.test(upper)
      ||
      /\b\d{1,3}[,.-]\d{3}\s*(?:MT|MTS)\b/i.test(upper)
      ||
      /\b\d+(?:\.\d+)?K\b/i.test(upper)
      ||
      /\b\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?K\b/i.test(upper)
    )
  );

  const hasTonnageSignals =
    /\bM[TV]\/?\s*[A-Z][A-Z0-9\s.'-]+/.test(upper) && /\b(?:OPEN|DWT|IMO|BUILT|BLT|BULK\s*CARRIER|WILL\s*OPEN)\b/.test(upper) ||
    /\bM[TV]\/?[\s\w]+(?:OPEN|WILL OPEN|'[0-9]{2}|IMO|DWT\/DRAFT|BULK CARRIER|FLAG[:\s]|BUILT:)/i.test(segment) ||
    /OPEN\s+[A-Z]+/.test(upper) && !hasTCSignals && !hasVCSignals;

  if (hasTonnageSignals) return "Tonnage";
  if (hasTCSignals && !hasVCSignals) return "TC";
  if (hasTCSignals && hasVCSignals) return "TC"; // prefer TC when both, route ports handle the rest
  if (hasVCSignals) return "VC";

  // Fallback heuristics
  if (/CARGO\s*[:\s]/i.test(segment) && /QUANTITY\s*[:\s]/i.test(segment)) return "VC";
  if (/CARGO\s*[:\s]/i.test(segment) && /DELY?\s*[:\s*]+/i.test(segment)) return "TC";
  if (
  parseQuantity(segment).min ||
  /\b\d+(?:\.\d+)?K\b/i.test(segment) ||
  /\b\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?K\b/i.test(segment)
) {
  return "VC";
}
  return null;
}

// ─── Entry Extractors ─────────────────────────────────────────────────────────

function extractVCEntry(segment: string, signature: ReturnType<typeof extractSignature>): ExtractedEntry {
  const lpMatch = segment.match(PATTERNS.loadPort);
  const dpMatch = segment.match(PATTERNS.dischargePort);
  const laycanMatch = segment.match(/LAYCAN[:\s:*]+([^\n]+)/i) || segment.match(/\bLC\s+([^\n]+)/i);

  const qty = parseQuantity(segment);
  const laycanText = laycanMatch ? laycanMatch[1] : segment;
  const { start, end } = parseLaycan(laycanText);

  const cargo = extractCargoName(segment);

  const route = extractRoutePorts(segment);
  const rawLoadPort = lpMatch ? lpMatch[1].trim().split("\n")[0] : route.load;
  const rawDischPort = dpMatch ? dpMatch[1].trim().split("\n")[0] : route.discharge;
  // resolveMultiPort handles "OR", "&", SPSB notation, and single ports
  const loadPort = resolveMultiPort(rawLoadPort);
  const dischPort = resolveMultiPort(rawDischPort);

  const restrictions: string[] = [];
  const restrMatches = segment.match(PATTERNS.restriction);
  if (restrMatches) restrictions.push(...restrMatches.map(r => r.trim()));

  const technical = extractCommonTechnicalFields(segment);

  // Confidence scoring
  let conf = 0.40;
  if (cargo) conf += 0.15;
  if (loadPort) conf += 0.10;
  if (dischPort) conf += 0.10;
  if (qty.min) conf += 0.10;
  if (start) conf += 0.08;
  if (end) conf += 0.04;
  if (technical.commission) conf += 0.03;
  if (technical.load_rate) conf += 0.03;
  if (resolveRegion(segment)) conf += 0.03;

  const fields: ExtractedFields = {
    email_type: "VC",
    cargo_name: cargo,
    cargo_type: cargo ? detectCargoType(segment) : null,
    min_size: qty.min,
    max_size: qty.max,
    load_port: loadPort,
    discharge_port: dischPort,
    laycan_start_date: start,
    laycan_end_date: end ?? (start ? new Date(new Date(start).getTime() + 5 * 86400000).toISOString().split("T")[0] : null),
    region: resolveRegion(segment),
    matching_region: resolveRegion(segment),
    pic: signature.pic,
    email_id: signature.email,
    phone_number: signature.phone,
    restriction: restrictions.length > 0 ? restrictions.join("; ") : null,
    ...technical,
  };

  return { entryType: "VC", confidence: Math.min(0.98, conf), extractionMethod: "rule-based", fields };
}

function extractTCEntry(segment: string, signature: ReturnType<typeof extractSignature>): ExtractedEntry {
  const accountMatch = segment.match(PATTERNS.account);
  const cargoMatch =
    segment.match(/(?:CARGO|COMMODITY)\s*:\s*([^\n*]+)/i) ||
    segment.match(/\d\s+TCT\s+(?:WITH\s+)?([A-Z][A-Z\s\/OR]+?)\s+IN\s+BLK/i) ||
    segment.match(/TCT\s+(?:WITH\s+)?([A-Z][A-Z\s\/OR]+?)\s+IN\s+BLK/i);

  const dwtInfo = parseDwt(segment);
  const laycanMatch =
    segment.match(/LAYCAN[:\s:*]+([^\n]+)/i) ||
    segment.match(/\bLC\s+([^\n]+)/i);
  const delMatch = segment.match(PATTERNS.delivery);
  const redelMatch = segment.match(PATTERNS.redelivery);
  const durationMatch =
    segment.match(/DURATION[:\s*]+([^\n*]+)/i)
    ||
    segment.match(/ABT\s+\d+\s+(?:DAYS?|DYS?)\s+WOG/i)
    ||
    segment.match(/UPTO\s+\d+\s*\/\s*\d+\s+MOS?/i);
  const laycanText = laycanMatch ? laycanMatch[1] : segment;
  const { start, end } = parseLaycan(laycanText);
  const duration = durationMatch ? parseDuration(durationMatch[0]) : null;

  const rawCargo = cargoMatch ? cargoMatch[1].trim().split("\n")[0].trim() : null;
  const cargo = extractCargoName(segment) ?? (rawCargo && isValidCargo(rawCargo) ? normalizeCargo(rawCargo) : null);

  const route = extractRoutePorts(segment);
  const rawDel = delMatch ? delMatch[1].trim().split("\n")[0] : route.load;
  const rawRedel = redelMatch ? redelMatch[1].trim().split("\n")[0] : route.discharge;
  const delPort = rawDel && isValidPort(rawDel) ? resolvePort(rawDel) : null;
  const redelPort = rawRedel && isValidPort(rawRedel) ? resolvePort(rawRedel) : null;

  const restrictions: string[] = [];
  const restrMatches = segment.match(/(?:NO\s+[A-Z]+[^\n.]*|EXCL\s+[A-Z]+[^\n.]*)/gi);
  if (restrMatches) restrictions.push(...restrMatches.map(r => r.trim()).slice(0, 5));

  const technical = extractCommonTechnicalFields(segment);

  // Confidence scoring
  let conf = 0.40;
  if (accountMatch) conf += 0.08;
  if (cargo) conf += 0.12;
  if (dwtInfo.min) conf += 0.10;
  if (delPort) conf += 0.10;
  if (redelPort) conf += 0.08;
  if (start) conf += 0.07;
  if (end) conf += 0.03;
  if (duration) conf += 0.04;
  if (technical.commission) conf += 0.04;
  if (technical.hire_rate) conf += 0.05;
  if (resolveRegion(segment)) conf += 0.02;

  const fields: ExtractedFields = {
    email_type: "TC",
    account_name: accountMatch ? accountMatch[1].trim().split("\n")[0].trim().replace(/\*+/g, "").trim() : null,
    cargo_name: cargo,
    cargo_type: cargo ? detectCargoType(segment) : null,
    min_size: dwtInfo.min,
    max_size: dwtInfo.max,
    del_port: delPort,
    redel_port: redelPort,
    laycan_start_date: start,
    laycan_end_date: end ?? (start ? new Date(new Date(start).getTime() + 5 * 86400000).toISOString().split("T")[0] : null),
    duration,
    region: resolveRegion(segment),
    matching_region: resolveRegion(segment),
    pic: signature.pic,
    email_id: signature.email,
    phone_number: signature.phone,
    restriction: restrictions.length > 0 ? restrictions.join("; ") : null,
    ...technical,
  };

  return { entryType: "TC", confidence: Math.min(0.98, conf), extractionMethod: "rule-based", fields };
}

function extractTonnageEntry(segment: string, signature: ReturnType<typeof extractSignature>): ExtractedEntry {
  const mvMatch =
    segment.match(PATTERNS.mvName) ||
    segment.match(/^(?:AA\)|BB\)|CC\)|[A-Z]+\))\s*(?:MV\s+)?([A-Z][A-Z\s]+?)(?:\s+\(|\/)/im) ||
    segment.match(/\bNAME\s*:\s*(?:M[TV]\/?\s+)?([A-Z][A-Z\s.'-]+?)(?:\s*\(|\n|,|\s+IMO)/i) ||
    segment.match(/\bVESSEL\s*:\s*(?:M[TV]\/?\s+)?([A-Z][A-Z\s.'-]+?)(?:\s*,|\s+\d{2,4}|\n)/i);

  // DWT extraction
  let dwtStr: string | null = null;
  const dwtExplicit =
    segment.match(/(?:DEADWEIGHT|DWT)\s*[/:–\s]+(?:SUMMER\s+)?(?:SALT\s+WATER[:\s]+)?(\d{2,3}[,.]?\d{3})/i) ||
    segment.match(/(\d{2,3}[,.]?\d{3})\s*(?:MT|MTS)\s+@/i) ||
    segment.match(/\b(\d{2,3}[,.]?\d{3})\s*DWT\b/i);

  if (dwtExplicit) {
    const raw = dwtExplicit[1].replace(/[,.]/g, "");
    const num = parseInt(raw, 10);
    if (num >= 1000) dwtStr = num.toString();
  } else {
    const shortDwt = segment.match(/\b(\d{2,3}(?:\.\d)?)\s*[Kk]\s*(?:DWT|[-'"\s\/]|$)/m);
    if (shortDwt) {
      const val = Math.round(parseFloat(shortDwt[1]) * 1000);
      if (val >= 10000) dwtStr = val.toString();
    }
  }

  // Vessel type
  const vesselType =
    /TANKER/i.test(segment) ? "Crude Oil Tanker" :
    /GAS\s*CARRIER/i.test(segment) ? "Gas Carrier" :
    /CONTAINER/i.test(segment) ? "Container Ship" :
    /BULK\s*CARRIER/i.test(segment) ? "Bulk Carrier" :
    // DWT-based vessel size class detection
    (() => {
      const dwtInfo = parseDwt(segment);
      return dwtInfo.vesselType ?? "Bulk Carrier";
    })();

  // Open port + date detection — also handles "OPEN: PORT\nDATE: date" split format
  const splitOpenMatch = segment.match(/OPEN\s*:\s*([^\n]+)\nDATE\s*:\s*([^\n]+)/i);

  const openMatch =
    splitOpenMatch ||
    segment.match(/OPEN\s+(?:AT\s+)?([A-Z][A-Z\s,]+?)\s+(?:O\/A\s+|ON\s+)?([^\n]+)/i) ||
    segment.match(/(?:WILL\s+)?OPEN\s+([A-Z]+(?:[,\s]+[A-Z]+)?)[,.]?\s*(\d{1,2}(?:TH|ST|ND|RD)?\s+[A-Z]+[,.\s]+\d{4})/i) ||
    segment.match(/OPEN\s+([A-Z]+)\s+(\d{1,2}[-\/]\d{1,2}\s+[A-Z]+)/i);

  let openDate: string | null = null;
  let closeDate: string | null = null;
  let openPort: string | null = null;

  if (openMatch) {
    const dateStr = openMatch[2] ?? openMatch[1];
    const { start, end } = parseLaycan(dateStr);
    const fixed = fixDates(start, end);
    openDate = fixed.open || null;
    closeDate = fixed.close || null;
    const rawPort = openMatch[1].trim();
    openPort = rawPort && isValidPort(rawPort) ? resolvePort(rawPort) : null;
  }

  const restrictions: string[] = [];
  const restrMatches = segment.match(/(?:NO\s+[A-Z\s]+|EXCL\s+[A-Z\s]+)/gi);
  if (restrMatches) restrictions.push(...restrMatches.slice(0, 3));

  const technical = extractCommonTechnicalFields(segment);

  // Confidence scoring
  let conf = 0.40;
  const vesselName = mvMatch ? mvMatch[1].trim() : null;
  if (vesselName) conf += 0.15;
  if (dwtStr) conf += 0.12;
  if (openPort) conf += 0.10;
  if (openDate) conf += 0.08;
  if (technical.imo) conf += 0.12;
  if (technical.built_year) conf += 0.05;
  if (technical.grt) conf += 0.04;
  if (technical.loa) conf += 0.03;
  if (resolveRegion(segment)) conf += 0.02;

  const fields: ExtractedFields = {
    email_type: "Tonnage",
    tonnage_name: vesselName,
    tonnage_type: vesselType,
    dwt: dwtStr,
    port: openPort,
    open_date: openDate,
    close_date: closeDate,
    region: resolveRegion(segment),
    matching_region: resolveRegion(segment),
    pic: signature.pic,
    email_id: signature.email,
    phone_number: signature.phone,
    restriction: restrictions.length > 0 ? restrictions.join("; ") : null,
    ...technical,
  };

  return { entryType: "Tonnage", confidence: Math.min(0.98, conf), extractionMethod: "rule-based", fields };
}

// ─── Template Detection ───────────────────────────────────────────────────────

interface Template { name: string; detect: (text: string) => boolean; boost: number; }

const TEMPLATES: Template[] = [
  { name: "YB Global Shipping", detect: (t) => /YB\s*Global\s*Shipping/i.test(t), boost: 0.05 },
  { name: "SeaSchiffe", detect: (t) => /Sea\s*Schiffe/i.test(t), boost: 0.05 },
  { name: "Centurion Bulk", detect: (t) => /CENTURION\s*BULK/i.test(t), boost: 0.05 },
  { name: "Standard TC Format", detect: (t) => /DELY?\s*[:\s*]+.*\nREDELY?\s*[:\s*]+/i.test(t), boost: 0.05 },
  { name: "Standard VC Format", detect: (t) => /LP\s*[:\s]+.*\nDP\s*[:\s]+/i.test(t), boost: 0.05 },
  { name: "MV Description Format", detect: (t) => /IMO\s+NO?\s*[:\s]+\d{7}/i.test(t), boost: 0.08 },
  { name: "TC Circular ACCT", detect: (t) => /^ACCT\s+/im.test(t), boost: 0.05 },
  { name: "Broker Bullet Format", detect: (t) => /^\d+\)\s+/m.test(t) && /CARGO|LAYCAN|DWT|TCT/.test(t), boost: 0.05 },
];

function detectTemplate(text: string): { name: string | null; boost: number } {
  for (const tpl of TEMPLATES) {
    if (tpl.detect(text)) return { name: tpl.name, boost: tpl.boost };
  }
  return { name: null, boost: 0 };
}

// ─── Dynamic Enterprise JSON Transformer ──────────────────────────────────────

function buildRestrictions(field: string | null | undefined): string[] {
  if (!field) return [];
  return field.split(/;\s*/).filter(p => p.trim().length > 3).map(p => p.trim());
}

function toTonnageEntry(entry: ExtractedEntry): TonnageEntry {
  const f = entry.fields;
  const openPort = f.port && isValidPort(f.port) ? f.port :
    f.del_port && isValidPort(f.del_port) ? f.del_port : "";

  const rawOpen = f.open_date || "";
  const rawClose = f.close_date || "";
  const { open: openDate, close: closeDate } = fixDates(rawOpen || null, rawClose || null);

  let dwt = "";
  if (f.dwt) dwt = normalizeDwtNumber(f.dwt);
  else if (f.min_size && f.min_size >= 1000) dwt = Math.round(f.min_size).toString();

  return {
    email_type: "Tonnage",
    vessel_name: f.tonnage_name ?? "",
    vessel_type: f.tonnage_type ?? "Bulk Carrier",
    dwt,
    built_year: f.built_year ?? "",
    flag: f.flag ?? "",
    imo: f.imo ?? "",
    grt: f.grt ?? "",
    nrt: f.nrt ?? "",
    loa: f.loa ?? "",
    beam: f.beam ?? "",
    grain_capacity: f.grain_capacity ?? "",
    open_port: openPort,
    open_date: openDate,
    close_date: closeDate,
    matching_region: f.matching_region ?? "",
    restrictions: buildRestrictions(f.restriction),
    confidence_score: Math.round(entry.confidence * 1000) / 1000,
  };
}

function toTCEntry(entry: ExtractedEntry): TCEntry {
  const f = entry.fields;

  const delPort = f.del_port && isValidPort(f.del_port) ? f.del_port : "";
  const redelPort = f.redel_port && isValidPort(f.redel_port) ? f.redel_port : "";
  const { open: laycanStart, close: laycanEnd } = fixDates(f.laycan_start_date || null, f.laycan_end_date || null);

  let dwt = "";
  if (f.min_size && f.min_size >= 1000) {
    dwt = f.max_size && f.max_size !== f.min_size
      ? `${Math.round(f.min_size)}-${Math.round(f.max_size)}`
      : Math.round(f.min_size).toString();
  }

  const cargo = f.cargo_name && isValidCargo(f.cargo_name) ? f.cargo_name : "";

  return {
    email_type: "TC",
    account_name: f.account_name ?? "",
    cargo,
    cargo_type: cargo ? (f.cargo_type ?? "") : "",
    dwt,
    del_port: delPort,
    redel_port: redelPort,
    laycan_start: laycanStart,
    laycan_end: laycanEnd,
    duration: f.duration ?? "",
    hire_rate: f.hire_rate ?? "",
    commission: f.commission ?? "",
    matching_region: f.matching_region ?? "",
    restrictions: buildRestrictions(f.restriction),
    confidence_score: Math.round(entry.confidence * 1000) / 1000,
  };
}

function toVCEntry(entry: ExtractedEntry): VCEntry {
  const f = entry.fields;

  const loadPort = f.load_port && isValidPort(f.load_port) ? f.load_port : "";
  const dischargePort = f.discharge_port && isValidPort(f.discharge_port) ? f.discharge_port : "";
  const { open: laycanStart, close: laycanEnd } = fixDates(f.laycan_start_date || null, f.laycan_end_date || null);

  let quantity = "";
  if (f.min_size !== null && f.min_size !== undefined) {
    quantity = Math.round(f.min_size).toString();
    if (f.max_size && f.max_size !== f.min_size) {
      quantity = `${Math.round(f.min_size)}-${Math.round(f.max_size)}`;
    }
  }

  const cargo = f.cargo_name && isValidCargo(f.cargo_name) ? f.cargo_name : "";

  return {
    email_type: "VC",
    cargo,
    cargo_type: cargo ? (f.cargo_type ?? "Dry Bulk") : "",
    quantity,
    quantity_unit: "MT",
    load_port: loadPort,
    discharge_port: dischargePort,
    laycan_start: laycanStart,
    laycan_end: laycanEnd,
    load_rate: f.load_rate ?? "",
    discharge_rate: f.discharge_rate ?? "",
    commission: f.commission ?? "",
    matching_region: f.matching_region ?? "",
    restrictions: buildRestrictions(f.restriction),
    confidence_score: Math.round(entry.confidence * 1000) / 1000,
  };
}

export function toEnterpriseEntry(entry: ExtractedEntry): EnterpriseEntry {
  if (entry.entryType === "Tonnage") return toTonnageEntry(entry);
  if (entry.entryType === "TC") return toTCEntry(entry);
  return toVCEntry(entry);
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateEnterpriseEntry(entry: EnterpriseEntry): EnterpriseEntry {
  const out = { ...entry } as EnterpriseEntry;

  if (out.email_type === "Tonnage") {
    const t = out as TonnageEntry;
    if (!isValidPort(t.open_port)) t.open_port = "";
    if (t.dwt) { const n = parseInt(t.dwt, 10); if (isNaN(n) || n < 1000) t.dwt = ""; }
    if (t.open_date && t.close_date) {
      const { open, close } = fixDates(t.open_date, t.close_date);
      t.open_date = open; t.close_date = close;
    }
    t.restrictions = t.restrictions.filter(r => r.trim().length > 3);
    t.confidence_score = Math.max(0, Math.min(1, t.confidence_score));
  } else if (out.email_type === "TC") {
    const t = out as TCEntry;
    if (!isValidPort(t.del_port)) t.del_port = "";
    if (!isValidPort(t.redel_port)) t.redel_port = "";
    if (!isValidCargo(t.cargo)) { t.cargo = ""; t.cargo_type = ""; }
    if (t.laycan_start && t.laycan_end) {
      const { open, close } = fixDates(t.laycan_start, t.laycan_end);
      t.laycan_start = open; t.laycan_end = close;
    }
    t.restrictions = t.restrictions.filter(r => r.trim().length > 3);
    t.confidence_score = Math.max(0, Math.min(1, t.confidence_score));
  } else if (out.email_type === "VC") {
    const t = out as VCEntry;
    if (!isValidPort(t.load_port)) t.load_port = "";
    if (!isValidPort(t.discharge_port)) t.discharge_port = "";
    if (!isValidCargo(t.cargo)) { t.cargo = ""; t.cargo_type = ""; }
    if (t.laycan_start && t.laycan_end) {
      const { open, close } = fixDates(t.laycan_start, t.laycan_end);
      t.laycan_start = open; t.laycan_end = close;
    }
    t.restrictions = t.restrictions.filter(r => r.trim().length > 3);
    t.confidence_score = Math.max(0, Math.min(1, t.confidence_score));
  }

  return out;
}

// ─── Main Extraction Functions ────────────────────────────────────────────────
function mergeML(
    fields: any,
    ml: any
) {

    if (!ml) {
        return fields;
    }

    if (!fields.cargo_name && ml.CARGO)
        fields.cargo_name = ml.CARGO;

    if (!fields.account_name && ml.CHARTERER)
        fields.account_name = ml.CHARTERER;

    if (
    !fields.laycan_start_date &&
    ml.LAYCAN &&
    /\d/.test(ml.LAYCAN)
) {
    fields.laycan_start_date = ml.LAYCAN;
}

if (
    !fields.laycan_end_date &&
    ml.LAYCAN &&
    /\d/.test(ml.LAYCAN)
) {
    fields.laycan_end_date = ml.LAYCAN;
}

   if (
    fields.email_type === "VC" &&
    !fields.load_port &&
    ml.LOAD_PORT &&
    ml.LOAD_PORT !== "/"
) {
    fields.load_port = ml.LOAD_PORT;
}

    if (
    !fields.port &&
    ml.PORT &&
    fields.email_type === "Tonnage"
) {
    fields.port = ml.PORT;
}

    if (
    fields.email_type === "VC" &&
    !fields.discharge_port &&
    ml.DISCHARGE_PORT &&
    ml.DISCHARGE_PORT !== "/"
) {
    fields.discharge_port = ml.DISCHARGE_PORT;
}
    if (
    !fields.del_port &&
    ml.LOAD_PORT &&
    fields.email_type === "VC"
) {
    fields.del_port = ml.LOAD_PORT;
}

    if (
        !fields.redel_port &&
        fields.email_type === "VC" &&
        ml.DISCHARGE_PORT
    ) {
        fields.redel_port = ml.DISCHARGE_PORT;
}

    if (!fields.email_id && ml.CONTACT)
        fields.email_id = ml.CONTACT;

    if (!fields.pic && ml.CONTACT)
        fields.pic = ml.CONTACT;

    if (!fields.tonnage_name && ml.VESSEL)
        fields.tonnage_name = ml.VESSEL;

    if (!fields.tonnage_type && ml.VESSEL_TYPE)
        fields.tonnage_type = ml.VESSEL_TYPE;

    if (!fields.vessel_type && ml.VESSEL_TYPE)
        fields.vessel_type = ml.VESSEL_TYPE;

    if (!fields.open_date && ml.ETA)
        fields.open_date = ml.ETA;

   

    if (!fields.dwt && ml.DWT)
        fields.dwt = ml.DWT;

    if (!fields.imo && ml.IMO)
        fields.imo = ml.IMO;

    return fields;
}


function sanitizeEmail(text: string): string {

    return text
        .replace(/\uFFFD/g, " ")
        .replace(/[“”]/g, "\"")
        .replace(/[‘’]/g, "'")
        .replace(/[–—]/g, "-")
        .replace(/\u0000/g, " ")
        .trim();
}

export function extractMaritimeEmail(emailText: string): ExtractionResult {
  
  const start = Date.now();
  console.log("INSIDE EXTRACT MARITIME EMAIL");
  
  const preprocessed =
      sanitizeEmail(
          preprocessEmail(emailText)
      );
  console.log("STEP 1");

console.log("ABOUT TO CALL ML");

let mlResult: any = {};

try {

    mlResult =
    runMLModel(preprocessed);

    console.log("ML CALL FINISHED");

    console.log("RAW ML RESULT:");
    console.log(mlResult);

    if (
        mlResult &&
        mlResult.PURE_ML_OUTPUT
    ) {
        mlResult =
        mlResult.PURE_ML_OUTPUT;
    }

    console.log("EXTRACTED ML ENTITIES:");
    console.log(mlResult);

}

  catch (err) {
    console.error(
        "ML failed:",
        err
    );

    mlResult = {};
  }
  const signature = extractSignature(preprocessed);
  const segments = segmentEmail(preprocessed);
  console.log("STEP 2");
  console.log("SEGMENT COUNT:", segments.length);

segments.forEach((s, i) => {
    console.log("\nSEGMENT", i + 1);
    console.log(s.substring(0, 250));
});
  const entries: ExtractedEntry[] = [];
  const typesFound = new Set<EntryType>();
  const template = detectTemplate(preprocessed);
  console.log("STEP 3");
  const pipeline: Pipeline = template.name ? "template" : "rule-based";

  for (const segment of segments) {
    console.log("PROCESSING SEGMENT");
    const segType = detectSegmentType(segment);
    if (!segType) continue;

    let entry: ExtractedEntry;
    if (segType === "VC") entry = extractVCEntry(segment, signature);
    else if (segType === "TC") entry = extractTCEntry(segment, signature);
    
    else entry = extractTonnageEntry(segment, signature);
    console.log(
    "\n========== PURE REGEX =========="
    );

    console.log(
   JSON.stringify(
      entry.fields,
      null,
      2
   )
);
    entry.fields =
    mergeML(
        entry.fields,
        mlResult
    );

     console.log(
    "\n========== AFTER MERGE =========="
);

console.log(
    JSON.stringify(
        entry.fields,
        null,
        2
    )
);

    if (template.boost > 0) {
      entry = { ...entry, confidence: Math.min(0.98, entry.confidence + template.boost), extractionMethod: pipeline };
    }
    entries.push(entry);
    if (segType) {
   typesFound.add(segType);
    }
  }

  // Fallback: treat entire email as one block
  if (entries.length === 0) {
    const fallbackType = detectSegmentType(preprocessed);
    if (fallbackType) {
      let entry: ExtractedEntry;
      if (fallbackType === "VC") entry = extractVCEntry(preprocessed, signature);
      else if (fallbackType === "TC") entry = extractTCEntry(preprocessed, signature);
      else entry = extractTonnageEntry(preprocessed, signature);
      console.log(
   "\n========== FALLBACK PURE REGEX =========="
);

console.log(
   JSON.stringify(
      entry.fields,
      null,
      2
   )
);

entry.fields =
mergeML(
   entry.fields,
   mlResult
);

console.log(
   "\n========== FALLBACK AFTER MERGE =========="
);

console.log(
   JSON.stringify(
      entry.fields,
      null,
      2
   )
);

      entries.push(entry);
     if (fallbackType) {
   typesFound.add(fallbackType);
    }
    }
  }

  let emailType: EmailType = "Unknown";
  if (typesFound.size > 1) emailType = "Mixed";
  else if (typesFound.size === 1) emailType = [...typesFound][0] as EmailType;

  const avgConfidence = entries.length > 0
    ? entries.reduce((s, e) => s + e.confidence, 0) / entries.length
    : 0.3;

  return {
    emailType, pipeline,
    confidence: avgConfidence,
    extractedEntries: entries,
    processingMs: Date.now() - start,
    llmUsed: false,
    estimatedCostUsd: 0.0001,
  };
}

export function extractToEnterpriseJSON(emailText: string): EnterpriseEntry[] {
  const result = extractMaritimeEmail(emailText);
  return result.extractedEntries
    .map(toEnterpriseEntry)
    .map(validateEnterpriseEntry);
}



