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
  depth?: string | null;
  draft?: string | null;
  lbp?: string | null;
  class_notation?: string | null;
  holds?: string | null;
  hatches?: string | null;
  cranes?: string | null;
  grabs?: string | null;
  speed?: string | null;
  consumption?: string | null;
  gear?: string | null;
  registry_port?: string | null;
  builder?: string | null;
  grain_capacity?: string | null;
  tpc?: string | null;
  dwcc?: string | null;
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
  call_sign?: string | null;
  callsign?: string | null;
  owner?: string | null;
  pni_club?: string | null;
  inmarsat?: string | null;
  iridium_phone?: string | null;
  starlink_phone?: string | null;
  last_cargo?: string | null;
  bale_capacity?: string | null;
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
  tonnage_name: string | null;
  tonnage_type: string | null;
  port: string | null;
  region: string | null;
  matching_region: string | null;
  open_date: string | null;
  close_date: string | null;
  dwt: string | null;
  pic: string | null;
  email_id: string | null;
  phone_number: string | null;
  latitude: string | null;
  longitude: string | null;
  flag: string | null;
  imo: string | null;
  grt: string | null;
  nrt: string | null;
  loa: string | null;
  beam: string | null;
  depth: string | null;
  draft: string | null;
  lbp: string | null;
  class: string | null;
  holds: string | null;
  hatches: string | null;
  cranes: string | null;
  grabs: string | null;
  speed: string | null;
  consumption: string | null;
  gear: string | null;
  registry_port: string | null;
  builder: string | null;
  tpc: string | null;
  grain_capacity: string | null;
  built_year: string | null;
  bale_capacity: string | null;
  call_sign: string | null;
  owner: string | null;
  pni_club: string | null;
  inmarsat: string | null;
  iridium_phone: string | null;
  starlink_phone: string | null;
  last_cargo: string | null;
  restrictions: string[];
  confidence_score: number;
}

export interface TCEntry {
  email_type: "TC";
  account_name: string | null;
  cargo_name: string | null;
  cargo_type: string | null;
  min_size: string | null;
  max_size: string | null;
  del_port: string | null;
  redel_port: string | null;
  laycan_start_date: string | null;
  laycan_end_date: string | null;
  duration: string | null;
  email_id: string | null;
  phone_number: string | null;
  latitude: string | null;
  longitude: string | null;
  region: string | null;
  matching_region: string | null;
  restrictions: string[];
  confidence_score: number;
}

export interface VCEntry {
  email_type: "VC";
  cargo_name: string | null;
  cargo_type: string | null;
  account_name: string | null;
  min_size: string | null;
  max_size: string | null;
  load_port: string | null;
  discharge_port: string | null;
  laycan_start_date: string | null;
  laycan_end_date: string | null;
  email_id: string | null;
  phone_number: string | null;
  latitude: string | null;
  longitude: string | null;
  region: string | null;
  matching_region: string | null;
  commission: string | null;
  load_rate: string | null;
  discharge_rate: string | null;
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
  "MED SEA": "Mediterranean", "BLACK SEA": "Black Sea", "RED SEA": "Red Sea",
  REDSEA: "Red Sea", "NORTH SEA": "North Sea", NSEA: "North Sea",
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
  "S.KOREA": "South Korea", SKOREA: "South Korea", "S.KR": "South Korea",
  CJK: "China-Japan-Korea",
  CONTINENT: "North European", NORWAY: "North European", PORTUGAL: "North European",
  ADRIATIC: "Mediterranean", MEDITERRANEAN: "Mediterranean",
  RECALADA: "East Coast South America", SANTOS: "East Coast South America",
  HOUSTON: "US Gulf Coast", TAMPA: "US Gulf Coast",
  FAREAST: "Far East", "F.EAST": "Far East",
  BAHODOPI: "Indonesia", CIGADING: "Indonesia", SURABAYA: "Indonesia", BONTANG: "Indonesia",
  INDONESIA: "Indonesia", PHILIPPINES: "Philippines",
  VIETNAM: "Vietnam", THAILAND: "Thailand",
  PAKISTAN: "Pakistan", BANGLADESH: "Bangladesh",
  CHINA: "China", INDIA: "India", TAIWAN: "Taiwan",
  TURKEY: "Turkey", UKRAINE: "Ukraine", RUSSIA: "Russia",
  BRAZIL: "Brazil", ARGENTINA: "Argentina",
  // Common compound abbreviations used in broker emails
  RUSSA: "Russia", RUSSE: "Russia", RUSS: "Russia",
  KUWAIT: "Arabian Gulf", BAHRAIN: "Arabian Gulf", SHARJAH: "Arabian Gulf",
  ABUDHABI: "Arabian Gulf", ABUDABI: "Arabian Gulf",
  SINGAPORE: "South East Asia", MALAYSIA: "South East Asia",
  MYANMAR: "South East Asia", SRILANKA: "South East Asia",
};

// Comprehensive port → region lookup (port name in UPPERCASE → maritime region label)
const PORT_TO_REGION: Record<string, string> = {
  // Philippines
  CEBU: "Philippines", DAVAO: "Philippines", MANILA: "Philippines",
  BATANGAS: "Philippines", SUBIC: "Philippines", CAGAYAN: "Philippines",
  ILIGAN: "Philippines",
  // South Korea
  ULSAN: "South Korea", ONSAN: "South Korea", PYEONGTAEK: "South Korea",
  INCHEON: "South Korea", GUNSAN: "South Korea", KWANGYANG: "South Korea",
  YEOSU: "South Korea", MOKPO: "South Korea", POHANG: "South Korea",
  BUSAN: "South Korea", BUKPYUNG: "South Korea",
  // China - additional ports beyond what's in PORT_ABBREVS
  SONGXIA: "China", FANGCHENG: "China", FANGCHENGGANG: "China",
  ZHANGJIAGANG: "China", CAOFEIDIAN: "China", YINGKOU: "China",
  RIZHAO: "China", JINGTANG: "China", TAICANG: "China",
  DONGJIAKOU: "China", YANGPU: "China", HAIKOU: "China",
  YANGZHOU: "China", WUHU: "China", HUANGPU: "China",
  XINSHA: "China", ZHONGSHAN: "China", ZHANJIANG: "China",
  LONGTAN: "China", PANGCHENG: "China", BEILUN: "China",
  SHANDONG: "China", JIANGYIN: "China", CHANGSHU: "China",
  FANGZHUANG: "China", WUGANG: "China", BAOSTEEL: "China",
  GUANGZHOU: "China", SHENZHEN: "China", CHIWAN: "China",
  QINGDAO: "China", TIANJIN: "China", NINGBO: "China",
  ZHOUSHAN: "China", SHANGHAI: "China", LIANYUNGANG: "China",
  SHIDAO: "China", LANSHAN: "China",
  // Vietnam
  HOCHIMINH: "Vietnam", VUNGTAU: "Vietnam",
  HAIPHONG: "Vietnam", DANANG: "Vietnam",
  QUYNHON: "Vietnam", CAMRANH: "Vietnam",
  // Australia
  GLADSTONE: "Australia", GERALDTON: "Australia", DAMPIER: "Australia",
  BRISBANE: "Australia", KEMBLA: "Australia", WOLLONGONG: "Australia",
  BOTANY: "Australia", TOWNSVILLE: "Australia", MACKAY: "Australia",
  NEWCASTLE: "Australia", SYDNEY: "Australia", MELBOURNE: "Australia",
  FREMANTLE: "Australia", ADELAIDE: "Australia",
  // Brazil / East Coast South America
  VITORIA: "East Coast South America", TUBARAO: "East Coast South America",
  SEPETIBA: "East Coast South America", GUAIBA: "East Coast South America",
  ITAGUAI: "East Coast South America", IMBITUBA: "East Coast South America",
  SUAPE: "East Coast South America", SANTOS: "East Coast South America",
  PARANAGUA: "East Coast South America", ITAQUI: "East Coast South America",
  PORTOALEGRE: "East Coast South America", FORTALEZA: "East Coast South America",
  // West Africa
  DAKAR: "West Africa", ABIDJAN: "West Africa", COTONOU: "West Africa",
  LOME: "West Africa", TEMA: "West Africa", CONAKRY: "West Africa",
  BOMA: "West Africa", MATADI: "West Africa", LAGOS: "West Africa",
  FREETOWN: "West Africa", MONROVIA: "West Africa", ACCRA: "West Africa",
  LIBREVILLE: "West Africa", DOUALA: "West Africa", BONNY: "West Africa",
  // East Africa
  MOMBASA: "East Africa", NACALA: "East Africa", BEIRA: "East Africa",
  MAPUTO: "East Africa", KILINDINI: "East Africa", LAMU: "East Africa",
  DJIBOUTI: "East Africa", BERBERA: "East Africa",
  // Middle East / Arabian Gulf
  JEBEL: "Arabian Gulf", FUJAIRAH: "Arabian Gulf",
  RUWAIS: "Arabian Gulf", MUSCAT: "Arabian Gulf", SOHAR: "Arabian Gulf",
  UMMASAR: "Arabian Gulf", UMQASAR: "Arabian Gulf", BASRA: "Arabian Gulf",
  SHUWAIKH: "Arabian Gulf", BANDAR: "Arabian Gulf",
  AQABA: "Arabian Gulf", BUSHEHR: "Arabian Gulf", DOHA: "Arabian Gulf",
  HODEIDAH: "Arabian Gulf", JEDDAH: "Arabian Gulf",
  DAMMAM: "Arabian Gulf", SHUAIBA: "Arabian Gulf", MINA: "Arabian Gulf",
  KHOR: "Arabian Gulf",
  // Mediterranean
  PIRAEUS: "Mediterranean", THESSALONIKI: "Mediterranean",
  ISTANBUL: "Mediterranean", MERSIN: "Mediterranean", ALIAGA: "Mediterranean",
  TUNISIE: "Mediterranean", SFAX: "Mediterranean", TARTOUS: "Mediterranean",
  LATAKIA: "Mediterranean", SALERNO: "Mediterranean", GIOIA: "Mediterranean",
  CAGLIARI: "Mediterranean", TARANTO: "Mediterranean", GELA: "Mediterranean",
  ARZEW: "Mediterranean", SKIKDA: "Mediterranean", ANNABA: "Mediterranean",
  ALGIERS: "Mediterranean", TRIPOLI: "Mediterranean",
  // Black Sea
  VARNA: "Black Sea", BOURGAS: "Black Sea", BATUMI: "Black Sea",
  POTI: "Black Sea", NIKOLAEV: "Black Sea", KHERSON: "Black Sea",
  MYKOLAIV: "Black Sea", MARIUPOL: "Black Sea",
  CONSTANTA: "Black Sea", ODESSA: "Black Sea", NOVOROSSIYSK: "Black Sea",
  PIVDENNIY: "Black Sea", ISKENDERUN: "Black Sea",
  // North European
  DUNKIRK: "North European", ROUEN: "North European", GHENT: "North European",
  AMSTERDAM: "North European", TERNEUZEN: "North European",
  IMMINGHAM: "North European", HULL: "North European", GRIMSBY: "North European",
  TILBURY: "North European", TEES: "North European", GOTHENBURG: "North European",
  LULEA: "North European", HELSINGBORG: "North European",
  OSLO: "North European", BERGEN: "North European",
  ROTTERDAM: "North European", ANTWERP: "North European",
  HAMBURG: "North European", GDANSK: "North European", SKAW: "North European",
  // US East Coast
  NORFOLK: "US East Coast", BALTIMORE: "US East Coast",
  SAVANNAH: "US East Coast", JACKSONVILLE: "US East Coast",
  PHILADELPHIA: "US East Coast", WILMINGTON: "US East Coast",
  // US Gulf
  BEAUMONT: "US Gulf Coast", "LAKE CHARLES": "US Gulf Coast",
  GALVESTON: "US Gulf Coast", HOUSTON: "US Gulf Coast",
  MOBILE: "US Gulf Coast", TAMPA: "US Gulf Coast",
  NEWORLEANS: "US Gulf Coast",
  // US West Coast
  LONGVIEW: "US West Coast", PORTLAND: "US West Coast",
  TACOMA: "US West Coast", SEATTLE: "US West Coast",
  VANCOUVER: "US West Coast", STOCKTON: "US West Coast",
  // West Coast South America
  "PTO MONTT": "West Coast South America", PTOMONTT: "West Coast South America",
  "PUERTO MONTT": "West Coast South America",
  VALPARAISO: "West Coast South America", IQUIQUE: "West Coast South America",
  ANTOFAGASTA: "West Coast South America", ARICA: "West Coast South America",
  CALLAO: "West Coast South America", GUAYAQUIL: "West Coast South America",
  // Pacific / Oceania
  AUCKLAND: "Pacific", LYTTELTON: "Pacific", TAURANGA: "Pacific",
  NOUMEA: "Pacific", PAPEETE: "Pacific",
  // South East Asia
  SINGAPORE: "South East Asia", SPORE: "South East Asia",
  LUMUT: "South East Asia", BINTULU: "South East Asia",
  KUANTAN: "South East Asia", COLOMBO: "South East Asia",
  PORTKLANG: "South East Asia", SURABAYA: "Indonesia",
  BAHODOPI: "Indonesia", CIGADING: "Indonesia",
  PAITON: "Indonesia", TELUKBAYUR: "Indonesia",
  BONTANG: "Indonesia", MOROWALI: "Indonesia",
  TAIPEI: "Taiwan", KAOHSIUNG: "Taiwan", TAICHUNG: "Taiwan",
  NANTONG: "China",
  CONTINENT: "North European", NORWAY: "North European",
  // East Coast India
  KAKINADA: "East Coast India", VIZAG: "East Coast India",
  VISAKHAPATNAM: "East Coast India", ENNORE: "East Coast India",
  KAMARAJAR: "East Coast India", HALDIA: "East Coast India",
  PARADIP: "East Coast India", DHAMRA: "East Coast India",
  GANGAVARAM: "East Coast India", KRISHNAPATNAM: "East Coast India",
  CHENNAI: "East Coast India",
  // West Coast India
  KANDLA: "West Coast India", MORMUGAO: "West Coast India",
  MUMBAI: "West Coast India", HAZIRA: "West Coast India",
  NHAVA: "West Coast India", MANGALORE: "West Coast India",
  COCHIN: "West Coast India", TUTICORIN: "West Coast India",
  PORBANDAR: "West Coast India", MUNDRA: "West Coast India",
  SIKKA: "West Coast India", OKHA: "West Coast India",
  PIPAVAV: "West Coast India",
  // Bangladesh / Pakistan
  CHITTAGONG: "Bangladesh", KARACHI: "Pakistan", BIK: "Arabian Gulf",
};

const EAST_COAST_INDIA_PORTS = new Set([
  "KAKINADA",
  "VIZAG",
  "VISAKHAPATNAM",
  "ENNORE",
  "KAMARAJAR",
  "HALDIA",
  "PARADIP",
  "DHAMRA",
  "GANGAVARAM",
  "CHENNAI",
  "KRISHNAPATNAM",
]);

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
  DHAMRA: "Dhamra, India",
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
  SHIDAO: "Shidao, China",
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
  NEWCASTLE: "Newcastle, Australia", SYDNEY: "Sydney, Australia",
  MELBOURNE: "Melbourne, Australia", FREMANTLE: "Fremantle, Australia",
  // Missing SE Asia ports
  HONGKONG: "Hong Kong, China", "HONG KONG": "Hong Kong, China",
  CAMPHA: "Cam Pha, Vietnam", "CAM PHA": "Cam Pha, Vietnam",
  CAMRANH: "Cam Ranh, Vietnam", "CAM RANH": "Cam Ranh, Vietnam",
  KAPAR: "Kapar, Malaysia", "PORT KLANG": "Port Klang, Malaysia",
  // Routing
  COGH: "Cape of Good Hope, South Africa",
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
  "POST-PANAMAX": { min: 80000, max: 109999, type: "Post-Panamax Bulk Carrier" },
  "POST PANAMAX": { min: 80000, max: 109999, type: "Post-Panamax Bulk Carrier" },
  POSTPANAMAX: { min: 80000, max: 109999, type: "Post-Panamax Bulk Carrier" },
  "BABY CAPE": { min: 90000, max: 109999, type: "Baby Cape Bulk Carrier" },
  BABYCAPE: { min: 90000, max: 109999, type: "Baby Cape Bulk Carrier" },
  CAPESIZE: { min: 150000, max: 999999, type: "Capesize Bulk Carrier" },
  CAPE: { min: 150000, max: 999999, type: "Capesize Bulk Carrier" },
  POST: { min: 80000, max: 109999, type: "Post-Panamax Bulk Carrier" },
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
  "COKING COAL": "Coking Coal", "MET COKE": "Metallurgical Coke",
  // Iron / Steel
  "IRON ORE": "Iron Ore", "IRON ORE FINES": "Iron Ore Fines", "IRON FINES": "Iron Ore Fines",
  "IRON ORE PELLETS": "Iron Ore Pellets", "IRON PELLETS": "Iron Ore Pellets",
  "IRON SLAG": "Iron Slag", "SLAG": "Slag", "STEEL SCRAP": "Steel Scrap",
  "STEEL COILS": "Steel Coils", "STL COILS": "Steel Coils", "COILS": "Steel Coils",
  "STEEL BILLETS": "Steel Billets", "BILLETS": "Steel Billets",
  "PIG IRON": "Pig Iron",
  // Hot Rolled / Cold Rolled Steel
  "HRC": "Hot Rolled Coils", "HRCTD": "Hot Rolled Coils", "HRCPO": "Hot Rolled Coils",
  "HRS": "Hot Rolled Steel", "CRC": "Cold Rolled Coils", "GI COILS": "GI Coils",
  // Scrap
  "MSP": "Metal Scrap Products", "SCRAP": "Steel Scrap",
  // Fertilizers (incl. common typos from broker emails)
  "UREA": "Urea", "DAP": "DAP Fertilizer", "MOP": "Potash (MOP)",
  "NPK": "NPK Fertilizer", "AN": "Ammonium Nitrate", "UAN": "Urea Ammonium Nitrate",
  "FERTS": "Fertilizer", "FERT": "Fertilizer",
  "FERTILIZER": "Fertilizer", "FERTILIZERS": "Fertilizer",
  "FERTILISERS": "Fertilizer", "FERTILISER": "Fertilizer",
  "FERILIZER": "Fertilizer", "FERILIZERS": "Fertilizer",
  "FERILIZER AND OTHER CARGO": "Fertilizer",
  "SUPERPHOSPHATE": "Superphosphate", "TSP": "Triple Superphosphate",
  "POTASH": "Potash", "SOP": "Sulphate of Potash",
  // Grains
  "GRAIN": "Grain", "GRAINS": "Grain", "WHEAT": "Wheat", "BARLEY": "Barley",
  "MAIZE": "Maize", "CORN": "Corn", "RICE": "Rice", "MILLET": "Millet",
  "BAGGED RICE": "Bagged Rice", "BULK RICE": "Bulk Rice",
  "SORGHUM": "Sorghum", "OATS": "Oats", "RYE": "Rye",
  "SOYA BEANS": "Soybeans", "SOYABEANS": "Soybeans", "SOYBEANS": "Soybeans",
  "SOYBEAN": "Soybeans", "GRAIN/SOYA": "Grain/Soybean",
  "SOYBEAN MEAL": "Soybean Meal", "SOYA MEAL": "Soybean Meal",
  "SUNFLOWER MEAL": "Sunflower Meal", "SBM": "Soybean Meal",
  "GRAIN/SUGAR": "Grain/Sugar", "CORN/SOYA": "Corn/Soybean",
  // Minerals
  "LIMESTONE": "Limestone", "CALCIUM CARBONATE": "Calcium Carbonate",
  "CHROME ORE": "Chrome Ore", "CHROMITE": "Chrome Ore",
  "NICKEL ORE": "Nickel Ore", "MANGANESE ORE": "Manganese Ore",
  "BAUXITE": "Bauxite",
  "MANGANESE": "Manganese Ore", "NICKEL": "Nickel Ore",
  "COPPER CONC": "Copper Concentrate", "COPPER CONCENTRATE": "Copper Concentrate",
  "CLINKER": "Clinker", "GYPSUM": "Gypsum", "BENTONITE": "Bentonite",
  "SALT": "Salt", "SULPHUR": "Sulphur", "SULFUR": "Sulphur",
  "PHOSPHATE": "Phosphate Rock", "ROCK PHOSPHATE": "Phosphate Rock",
  "SAND": "Sand", "SILICA SAND": "Silica Sand",
  "KAOLIN": "Kaolin", "DOLOMITE": "Dolomite", "QUARTZ": "Quartz",
  // Oil / Petrochemicals
  "PETCOKE": "Petroleum Coke", "PET COKE": "Petroleum Coke", "PETROLEUM COKE": "Petroleum Coke",
  "RAW SUGAR": "Raw Sugar", "SUGAR": "Sugar",
  // Agricultural / Vegetable
  "PALM OIL": "Palm Oil", "VEGETABLE OIL": "Vegetable Oil",
  "RAPE SEED": "Rapeseed", "RAPESEED": "Rapeseed",
  // Harmless / General
  "BULK HARMLESS": "Bulk Harmless Cargo", "BULK HARMLESS CARGO": "Bulk Harmless Cargo",
  "LAWFUL BULK": "Lawful Bulk Cargo", "HARMLESS BULK": "Bulk Harmless Cargo",
  "GENERAL CARGO": "General Cargo",
  // Ore (generic — keep as-is but map common patterns)
  "IRON ORE IN BULK": "Iron Ore", "ORE IN BULK": "Iron Ore",
  // Region / route abbreviations as cargo context helpers
  "PHILIPPINE": "Philippines",
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
  /\bPHONE\b|\bMOBILE\b|\bWHATSAPP\b/i,
  /^(HOLD|HATCH|DECK|WINCH|CRANE)\b/i,
  // Charter/legal terms that are NOT cargo
  /^TCT\s+WITH\b/i,
  /\bLAWFUL{1,2}\s*\/\s*HARMLESS\b/i,
  /^(?:LAWFUL|HARMLESS|LEGAL|LAWFULL)$/i,
  /^(?:ALL\s+KINDS?|ANY\s+LAWFUL|USUAL|CUSTOMARY|GENERAL\s+CARGO)$/i,
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
  if (t.length <= 3 && !PORT_ABBREVS[t]) return false;
  if (REGION_MAP[t] !== undefined && !PORT_ABBREVS[t]) return false;
  if (/^\d/.test(t)) return false;
  if (/^\d+$/.test(t)) return false;
  if (/^\d+SP\b/i.test(t)) return false;
  // Reject charterparty terms
  if (/^(?:MOLOO|MOLCO|FIOST|FIOS|LINER|DLOSP|CHOPT|APS|AFS|TIP|DIRECT)$/i.test(t)) return false;
  // Reject company names (contain GmbH, Ltd, Co., Inc., BV, etc.)
  if (/\b(?:GMBH|LTD|INC|LLC|BV|NV|SA|CORP|COMPANY|CO\.|PTE|PTY|AS\b)\b/i.test(t)) return false;
  // Reject phone/mobile lines
  if (/\b(?:MOBILE|PHONE|TEL|FAX|EMAIL|WHATSAPP)\s*[:\+\d]/i.test(t)) return false;
  // Reject generic broker phrases and placeholder text
  if (/^(?:THE FOLLOWING|AS FOLLOWS|PLS PROPOSE|KINDLY|DEAR SIRS|POSITIONS|FOLLOWING POSITIONS|THE FOLLOWING POSITIONS|HATCH BOX|TONNAGES FROM|WITH|VIEW DETAILS|WE ARE OPEN WITH)$/i.test(t)) return false;
  // Reject common port placeholder text used in templates (e.g. "LOAD PORT", "DISCHARGE PORT")
  if (/^(?:LOAD\s+PORT|DISCHARGE\s+PORT|LOADING\s+PORT|DISCHARGING\s+PORT|TBD|TBC|TBA|TO\s+BE\s+ADVISED|TO\s+BE\s+CONFIRMED|ANY\s+PORT|ANY\s+SAFE\s+PORT)$/i.test(t)) return false;
  // Reject if contains digit-heavy segments (phone numbers embedded)
  if (/\+?\d[\d\s\-\.()]{8,}/.test(t)) return false;
  return true;
}

function isValidCargo(name: string): boolean {
  if (!name) return false;
  const t = name.trim().toUpperCase();
    if (t.length < 2) return false;
  if (CARGO_BLACKLIST.has(t)) return false;
  for (const pat of CARGO_BLACKLIST_PATTERNS) {
    if (pat.test(name)) return false;
  }

  // Reject if any word is a ship part
  const words = t.split(/\s+/);
  if (words.every(w => SHIP_PART_WORDS.has(w))) return false;
  return true;
}

function isValidPhone(phone: string | null): boolean {
  if (!phone) return false;
  const cleaned = phone.trim();
  const digits = cleaned.replace(/\D/g, "");
  // Must have at least 8 digits, no more than 20
  if (digits.length < 8 || digits.length > 20) return false;
  if (/^\d\)/.test(cleaned)) return false;
  if (!/^[\+\d\s\-()\[\].#,ext]+$/i.test(cleaned)) return false;
  if (/%/.test(cleaned)) return false;
  // Reject if it looks like a date: 8 digits in YYYYMMDD or DDMMYYYY format
  if (/^\d{8}$/.test(digits) && (() => {
    const y1 = parseInt(digits.slice(0, 4)); const m1 = parseInt(digits.slice(4, 6)); const d1 = parseInt(digits.slice(6, 8));
    const d2 = parseInt(digits.slice(0, 2)); const m2 = parseInt(digits.slice(2, 4)); const y2 = parseInt(digits.slice(4));
    return (y1 >= 1990 && y1 <= 2040 && m1 >= 1 && m1 <= 12 && d1 >= 1 && d1 <= 31) ||
           (d2 >= 1 && d2 <= 31 && m2 >= 1 && m2 <= 12 && y2 >= 1990 && y2 <= 2040);
  })()) return false;
  // Reject if starts with 00 and looks like a date reference number (too short after country code)
  if (/^00\d{6,7}$/.test(digits)) return false;
  // Reject pure year ranges like 20252030
  if (/^20[0-3]\d{5}$/.test(digits) && parseInt(digits.slice(0, 4)) >= 2020 && parseInt(digits.slice(0, 4)) <= 2035) return false;
  // Must not be a 7-digit IMO number
  if (/^\d{7}$/.test(digits)) return false;
  // Phone must have at least one of: +, space, dash, parenthesis for international format, or be >= 10 digits
  if (digits.length < 10 && !/[\+\-\s()]/.test(cleaned)) return false;
  return true;
}

function normalizeDwtNumber(raw: string | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  const kMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*[Kk]$/);
  if (kMatch) {
    const val = Math.round(parseFloat(kMatch[1]) * 1000);
    return val >= 1000 ? val.toString() : "";
  }
  // Only take the first line to prevent multi-line concatenation
  const firstLine = trimmed.split(/[\n\r]/)[0].trim();
  // Strip commas (thousands separator) but keep dots for decimals
  const cleaned = firstLine.replace(/,/g, "").replace(/\s/g, "");
  const num = Math.round(parseFloat(cleaned));
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
  redelivery: /(?:REDELY?|RE-?DEL|REDEL|RE-?DELY|REDELIVERY|RE-?DELIVERY)[:\s*]+([^\n*]+)/i,
  loadPort: /(?:LP|LOADING\s*PORT?|POL|LOAD\s*PORT)[:\s]+([^\n]+)/i,
  dischargePort: /(?:DP|DISCHARGE\s*PORT?|POD|DISCH\s*PORT)[:\s]+([^\n]+)/i,
  cargo: /(?:CARGO|COMMODITY|COMMODIT)[:\s*]+([^\n*]+)/i,
  tonnage: /(?:TONNAGE|VESSEL)[:\s*]+([^\n*]+)/i,
  imo: /(?:IMO|IMO[#\.]|IMO\s+N\.?|IMO\s+NO\.?|IMO\s+NUMBER|IMO\s*\.)[:#\s\-]*?(\d{7})/i,
  grt: /(?:GRT|GT|GROSS\s*(?:REG(?:ISTERED)?\s*)?TON(?:NAGE)?)\b\s*[:\-–]?\s*([\d,\.\s]{3,12})/i,
  nrt: /(?:NRT|NT|NET\s*(?:REG(?:ISTERED)?\s*)?TON(?:NAGE)?)\b\s*[:\-–]?\s*([\d,\.\s]{3,12})/i,
  loa: /(?:LOA|LENGTH\s*(?:OVERALL)?|LENGTH\s*O\/?A?)\s*[:\-\/]*\s*(\d+(?:[.,]\d+)?)\s*(?:M|MTS?)?\b/i,
  beam: /(?:BEAM|BREADTH|MOULDED\s*BREADTH)\s*[:\-\/]*\s*(\d+(?:[.,]\d+)?)\s*(?:M|MTS?)?\b/i,
  tpc: /\bTPC\b\s*(?:[:\-\/\s]|ON\s+)?(\d+(?:[.,]\d+)?)/i,
  grainCap: /(?:GRAIN\s*(?:CAPA|CAPACITY|CAP)?|GRAIN)\s*[:\-–\/]*\s*([\d,\.\s]{3,12})/i,
  loadRate: /(?:LOAD(?:ING)?\s*RATE|L\/?R|LDRATE|LDNG\s*RATE)\s*[:\-]*\s*([\d,]{3,10})\s*(?:MT\s*\/?\s*D(?:AY)?|PDPR?|PMD|MTONS)/i,
  dischargeRate: /(?:DISCH(?:ARGE)?\s*RATE|D\/?R|DISRATE|DSCRG\s*RATE)\s*[:\-]*\s*([\d,]{3,10})\s*(?:MT\s*\/?\s*D(?:AY)?|PDPR?|PMD|MTONS)/i,
  commission: /(?:ADCOM|ADD(?:RESS)?\s*COMM(?:ISSION)?|COMM(?:ISSION)?|BROKERAGE)\s*[:\s]*(\d+(?:\.\d+)?)\s*(?:%|PCT)?/i,
  commissionReverse: /(\d+(?:\.\d+)?)\s*(?:PCT|%)\s*(?:TTL|TOTAL|COMM|ADCOM|ADD)/i,
  quantity: /(?:M\/M\s*)?(\d{1,3}(?:[,.\s]\d{3})*)\s*(?:MTS?|METRIC\s*TONS?)/i,
  quantityRange: /(\d{1,3}(?:[,.\s]\d{3})*)\s*[-–]\s*(\d{1,3}(?:[,.\s]\d{3})*)\s*(?:MTS?|METRIC\s*TONS?)/i,
  restriction: /(?:(?:EXCL(?:UDING)?\.?|NO\s+CALL(?:ING)?\s+(?:AT\s+)?|NO\s+|NOT\s+(?:FOR|TO|CALLING\s+AT)\s+|AVOID(?:ING)?\s+)\s*(?:PG|HRA|GOA|ADEN|RED\s*SEA|BLACKLISTED|IRAN(?:IAN)?|ISRAEL[I]?|NIGERIA|LAGOS|RUSSIA[N]?|SANCTIONED|NORTH\s*KOREA|CHINA(?:ESE)?|INDONESIA(?:N)?|PAKISTAN[I]?|INDIA[N]?|CUBA[N]?|MYANMAR|VENEZUELA[N]?|UKRAIN(?:E|IAN)?|CRIMEA[N]?|BANNED|EMBARGOED|RESTRICTED|PIRACY|PIRACY\s*ZONE|WAR\s*RISK|WARZONE|CONFLICT|EMBARGO|SANCTIONED\s*COUNTRY|HIGH\s*RISK|HRA\s*ZONE)(?:\s+(?:WATERS|PORTS?|ZONE|AREA|PORTS?))?|(?:EXCL|EXCLUDING)\s+(?:WAR|WARZONE|CONFLICT|EMBARGO|HRA|PIRACY)\b|\bEXCL\s+HRA\b|\bNO\s+HRA\b|\bEXCL\s+WAR\b|\bNO\s+WAR\s+RISK\b|\bEXCL\s+RUSSIA\b|\bNO\s+RUSSIA\b|\bEXCL\s+IRAN\b|\bEXCL\s+ISRAEL\b|\bEXCL\s+RED\s*SEA\b)/gi,
  mvName: /\bM[TV]\/?\.*\s+([A-Z][A-Z0-9\s.'-]+?)(?:\s*[\(\/'",]|\s+\d{4}BLT|\s+\d{2,3}K\s|\n|\s+IMO|\s+BUILT|\s+BLT\b|\s*,\s*BLT|\s*,\s*\d{4})/i,
  hireRate: /(?:HIRE(?:\s*RATE)?|TCH?)\s*[:\-]*\s*(?:USD?\.?\s*)?(\d{1,3}(?:,\d{3})+|\d{4,6})\s*(?:\/?\s*(?:PER\s+DAY|DAY|PDPR?|PMD|PDPW|DPP?))?/i,
  builtYear: /(?:(?:BUILT|BLT|BLT\.)[:\s\/.]*((?:'|\u2019)?\d{2,4}))|(?:(?:BUILT|BLT|BLT\.)\s+[A-Z]{3,9}\.?\s+(\d{4}))|(\d{2,4})\s*(?:BLT|BUILT)\b/i,
  flag: /\bFLAG\s*[:\-\s]*([A-Z][A-Z ]{1,30}?)(?=\s+(?:POR|OFF|IMO|CALL|TEL|FAX|CLASS|BUILT|BLT|MOBILE|PHONE|WHATSAPP|CONTACT|EMAIL|E-MAIL|$)|[\/\n,]|$)/im,
};

/**
 * Find the boundary index where a forwarded message begins inside the text.
 * Returns the character index of the inner "From:" header (i.e., the second
 * occurrence) if the email looks forwarded, otherwise -1.
 */
function findForwardedMessageStart(text: string): number {
  // Split on newlines and look for a second "From:" line that appears after at least 3 lines of content
  const lines = text.split(/\r?\n/);
  let outerFromFound = false;
  let charPos = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^From\s*:/i.test(line.trim())) {
      if (!outerFromFound) {
        outerFromFound = true;
      } else if (i > 3) {
        // This is the inner From: — return position
        return charPos;
      }
    }
    charPos += line.length + 1; // +1 for the newline
  }
  return -1;
}

function pickBestEmail(text: string): string | null {
  // 1. If this is a forwarded email, prefer the inner/original sender's email
  const fwdStart = findForwardedMessageStart(text);
  if (fwdStart > 0) {
    const innerBlock = text.slice(fwdStart);
    // Try From: header in inner block
    const innerFrom = innerBlock.match(/^From\s*:\s*(?:[^<\n]*<)?([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/im);
    if (innerFrom && innerFrom[1]) return innerFrom[1].toLowerCase().trim();
    // Try any email in inner block (chartering/broker preferred)
    const innerAll = (innerBlock.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []).map(s => s.toLowerCase());
    for (const e of innerAll) {
      if (/charter|chartering|fixture|fixing|broker|ship|marine|maritime/i.test(e)) return e;
    }
    if (innerAll.length > 0) return innerAll[0];
  }

  // 2. Parse outer From: / Reply-To: header
  const headerMatch = text.match(/^(?:From|Reply-To)\s*:\s*(?:[^<\n]*<)?([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/im);
  if (headerMatch && headerMatch[1]) return headerMatch[1].toLowerCase().trim();

  const all = (text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []).map(s => s.toLowerCase());
  if (all.length === 0) return null;

  // 3. Prefer chartering / fixture / broker / ship addresses
  for (const e of all) {
    if (/charter|chartering|fixture|fixing|broker|ship|marine|maritime/i.test(e)) return e;
  }
  // 4. Prefer explicitly labelled E-MAIL: address
  const labelMatch = text.match(/\bE-?MAIL\s*[:\-\s]+([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i);
  if (labelMatch && labelMatch[1]) return labelMatch[1].toLowerCase().trim();

  // 5. Return first valid email found
  return all[0];
}

function normalizePhone(raw: string): string {
  // Normalize "+ 91 ..." → "+91..." (remove space between + and country code)
  return raw.replace(/^\+\s+(\d)/, "+$1").replace(/\s*\([^)]*$/, "").trim();
}

function pickBestPhone(text: string): string | null {
  // For forwarded emails, prefer the inner/original broker's phone
  const fwdStart = findForwardedMessageStart(text);
  const searchText = fwdStart > 0 ? text.slice(fwdStart) : text;

  const lines = searchText.split(/\r?\n/);
  // prefer lines with Tel/Phone/Mob/WhatsApp
  for (const line of lines) {
    if (/\b(?:Tel|Phone|Mob|Mobile|WhatsApp)\b/i.test(line)) {
      // Handle "+ NN" format (space between + and digits)
      const m = line.match(/(\+\s?\d[\d\s\-().]{6,30}|\d[\d\s\-().]{9,30})/);
      if (m) {
        const candidate = normalizePhone(m[1]);
        if (isValidPhone(candidate)) return candidate;
      }
    }
  }
  // fallback: any phone-like token — search line-by-line to avoid multiline false positives
  for (const line of lines) {
    const m = line.match(/(\+\s?\d[\d\s\-().]{6,30}|\d[\d\s\-().]{9,30})/);
    if (m) {
      const candidate = normalizePhone(m[1]);
      if (isValidPhone(candidate)) return candidate;
    }
  }
  return null;
}

// ─── Preprocessing ────────────────────────────────────────────────────────────

// Lines that indicate start of email footer / signature block
const SIGNATURE_TRIGGERS = [
  /^(?:Best\s+Regards?|Kind\s+Regards?|Regards?|Thanks?\s+&?\s+Regards?|Warm\s+Regards?)\s*[,.:+]?\s*$/i,
  /^(?:Yours?\s+(?:faithfully|sincerely|truly))\s*[,.:+]?\s*$/i,
  /^(?:With\s+(?:best\s+)?regards?)\s*[,.:+]?\s*$/i,
  /^(?:Cheers?|Thanks?|Thank\s+You|Thanking\s+You)\s*[,.:+]?\s*$/i,
  /^(?:BRGDS?|B\/RGDS?)\s*[,.]?\s*$/i,
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
    .replace(/\bPHILIPPINE\b/gi, "PHILIPPINES")
    .replace(/\bS\.?\s*KR\b/gi, "SKOREA")
    .replace(/\bZJG\b/gi, "ZHANGJIAGANG")
    .replace(/\bNANTONG\b/gi, "NANTONG")
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

export function cleanEmailBody(emailText: string): string {
  return normalizeEmailText(emailText)
    .replace(/[\u0080-\u009F\uFFFD]/g, " ")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^\u0009\u000A\u000D\u001F-\u007F]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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
  const ref = EMAIL_REFERENCE_DATE || new Date();
  const curYear = ref.getFullYear();
  const curMonth = ref.getMonth() + 1;
  const targetMonth = parseInt(monthNum, 10);
  // If target month is already past this year, use next year
  if (targetMonth < curMonth - 1) return (curYear + 1).toString();
  return curYear.toString();
}

let EMAIL_REFERENCE_DATE: Date | null = null;

function parseDateRobust(s: string): Date | null {
  // Try native parse first
  let dt = new Date(s);
  if (!isNaN(dt.getTime())) return dt;

  // "Friday, October 10, 2025 6:49:33 PM" → strip day-of-week prefix
  const stripDay = s.replace(/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*/i, "");
  dt = new Date(stripDay);
  if (!isNaN(dt.getTime())) return dt;

  // "10 October 2025 18:46" or "10 Oct 2025 18:46"
  const ddMonYyyy = s.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})(?:\s+(\d{1,2}:\d{2}))?/);
  if (ddMonYyyy) {
    const [, dd, mon, yyyy, time] = ddMonYyyy;
    const iso = `${yyyy}-${(MONTH_MAP[mon.toUpperCase()] || MONTH_MAP[mon.slice(0,3).toUpperCase()] || "01")}-${dd.padStart(2,"0")}${time ? "T"+time : ""}`;
    dt = new Date(iso);
    if (!isNaN(dt.getTime())) return dt;
  }

  // "10/OCT/2025" or "10-OCT-2025"
  const slashMon = s.match(/(\d{1,2})[\/\-]([A-Za-z]{3})[\/\-](\d{4})/);
  if (slashMon) {
    const [, dd, mon, yyyy] = slashMon;
    const mo = MONTH_MAP[mon.toUpperCase()] || "01";
    dt = new Date(`${yyyy}-${mo}-${dd.padStart(2,"0")}`);
    if (!isNaN(dt.getTime())) return dt;
  }

  return null;
}

function setEmailReferenceDate(text: string) {
  if (!text) return;

  // Try Sent: / Date: headers — multiple formats
  const candidates: string[] = [];
  const sentMatch = text.match(/^Sent\s*:\s*(.+)$/im) || text.match(/^Date\s*:\s*(.+)$/im);
  if (sentMatch) candidates.push(sentMatch[1].trim());

  // Also grab the second Sent: (inner forwarded message) if present
  const allSent = [...text.matchAll(/^Sent\s*:\s*(.+)$/gim)];
  for (const m of allSent) candidates.push(m[1].trim());

  for (const s of candidates) {
    const dt = parseDateRobust(s);
    if (dt) {
      EMAIL_REFERENCE_DATE = dt;
      return;
    }
  }
}

function parseLaycan(text: string): { start: string | null; end: string | null } {
  const upper = text.toUpperCase().trim();

  // "FIRST HALF JULY 2026" / "1H JULY" / "1ST HALF JULY"
  const firstHalfMatch = upper.match(/\b(?:FIRST\s+HALF|1ST\s+HALF|1H)\s+(?:OF\s+)?([A-Z]{3,9})(?:\s+(\d{4}))?\b/);
  if (firstHalfMatch) {
    const m = MONTH_MAP[firstHalfMatch[1]];
    if (m) {
      const yr = firstHalfMatch[2] || inferYear(m);
      return { start: `${yr}-${m}-01`, end: `${yr}-${m}-15` };
    }
  }

  // "SECOND HALF JULY 2026" / "2H JULY" / "2ND HALF JULY"
  const secondHalfMatch = upper.match(/\b(?:SECOND\s+HALF|2ND\s+HALF|2H)\s+(?:OF\s+)?([A-Z]{3,9})(?:\s+(\d{4}))?\b/);
  if (secondHalfMatch) {
    const m = MONTH_MAP[secondHalfMatch[1]];
    if (m) {
      const yr = secondHalfMatch[2] || inferYear(m);
      const lastDay = new Date(parseInt(yr), parseInt(m), 0).getDate();
      return { start: `${yr}-${m}-16`, end: `${yr}-${m}-${lastDay}` };
    }
  }

  // "MID JULY 2026" / "MID-JULY"
  const midMonthMatch = upper.match(/\bMID[-\s]+([A-Z]{3,9})(?:\s+(\d{4}))?\b/);
  if (midMonthMatch) {
    const m = MONTH_MAP[midMonthMatch[1]];
    if (m) {
      const yr = midMonthMatch[2] || inferYear(m);
      return { start: `${yr}-${m}-10`, end: `${yr}-${m}-20` };
    }
  }

  // "END JULY 2026" / "END OF JULY"
  const endMonthMatch = upper.match(/\bEND\s+(?:OF\s+)?([A-Z]{3,9})(?:\s+(\d{4}))?\b/);
  if (endMonthMatch) {
    const m = MONTH_MAP[endMonthMatch[1]];
    if (m) {
      const yr = endMonthMatch[2] || inferYear(m);
      const lastDay = new Date(parseInt(yr), parseInt(m), 0).getDate();
      const startDay = lastDay - 4;
      return { start: `${yr}-${m}-${startDay}`, end: `${yr}-${m}-${lastDay}` };
    }
  }

  // "EARLY JULY 2026" / "EARLY PART OF JULY"
  const earlyMonthMatch = upper.match(/\bEARLY\s+(?:PART\s+OF\s+)?([A-Z]{3,9})(?:\s+(\d{4}))?\b/);
  if (earlyMonthMatch) {
    const m = MONTH_MAP[earlyMonthMatch[1]];
    if (m) {
      const yr = earlyMonthMatch[2] || inferYear(m);
      return { start: `${yr}-${m}-01`, end: `${yr}-${m}-10` };
    }
  }

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

  // "18th - 20th JULY, 2025" or "16-21 OCT 2025" or "20 ~ 25 JUN 2026"
  const rangeMatch = upper.match(/(\d{1,2})(?:ST|ND|RD|TH)?\s*[-–~\/]\s*(\d{1,2})(?:ST|ND|RD|TH)?\s+([A-Z]+)[,.\s]+(\d{4})/);
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
  const rangeNoYear = upper.match(/(\d{1,2})(?:ST|ND|RD|TH)?\s*[-–~]\s*(\d{1,2})(?:ST|ND|RD|TH)?\s+([A-Z]+)\s*$/);
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

  const rangeNoYearWithTrailingYear = upper.match(/(\d{1,2})(?:ST|ND|RD|TH)?\s*[-–]\s*(\d{1,2})(?:ST|ND|RD|TH)?\s+([A-Z]+)(?:[,\.\s]+\d{3,4})?/);
  if (rangeNoYearWithTrailingYear) {
    const [, d1, d2, mon] = rangeNoYearWithTrailingYear;
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

  // Range like "50,000 - 55,000 MT" or "50,000/55,000 MT"
  const rangeMatch = noRates.match(/(\d{1,3}(?:[,.\s]\d{3})*)\s*[-–\/]\s*(\d{1,3}(?:[,.\s]\d{3})*)\s*(?:MTS?|METRIC\s*TONS?)/);
  if (rangeMatch) {
    const a = parseInt(rangeMatch[1].replace(/[,.\s]/g, ""));
    const b = parseInt(rangeMatch[2].replace(/[,.\s]/g, ""));
    return { min: Math.min(a, b), max: Math.max(a, b) };
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
  // k-notation vessel size (very common in informal broker emails):
  // "8k VSL", "20k vsl", "8-10K VSL", "22.5-30k" (followed by vsl/vessel or standalone at sentence boundary)
  const kVslRange = upper.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*[kK]\s*(?:VSL|VESSEL|DWT|MT)?\b/);
  if (kVslRange) {
    const a = Math.round(parseFloat(kVslRange[1]) * 1000);
    const b = Math.round(parseFloat(kVslRange[2]) * 1000);
    if (a >= 1000 && b >= 1000) return { min: Math.min(a, b), max: Math.max(a, b) };
  }
  const kVslSingle = upper.match(/\b(\d+(?:\.\d+)?)\s*[kK]\s*(?:VSL|VESSEL)\b/)
    || upper.match(/(?:NEED|OPEN|REQUIRE|AROUND)\s+(?:ABT\s+)?(\d+(?:\.\d+)?)\s*[kK]\b/);
  if (kVslSingle) {
    const val = Math.round(parseFloat(kVslSingle[1]) * 1000);
    if (val >= 1000) return { min: val, max: val };
  }
  return { min: null, max: null };
}

function extractSignature(text: string): { pic: string | null; email: string | null; phone: string | null } {
  // Detect forwarded email: if there is an inner "From:" header, prefer info from the inner block
  const fwdStart = findForwardedMessageStart(text);
  const innerBlock = fwdStart > 0 ? text.slice(fwdStart) : null;
  // Use inner block for PIC/phone extraction when available; fall back to full text
  const searchText = innerBlock ?? text;

  // Extract emails: prefer inner From: header (forwarded email) → outer From: → chartering context
  let email: string | null = null;

  if (innerBlock) {
    // 1a. Inner From: header (original sender)
    const innerFrom = innerBlock.match(/^From\s*:\s*(?:[^<\n]*<)?([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/im);
    if (innerFrom && innerFrom[1]) email = innerFrom[1].toLowerCase().trim();
    if (!email) {
      // 1b. Any chartering email in inner block
      const innerAll = (innerBlock.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || []).map(s => s.toLowerCase());
      for (const e of innerAll) {
        if (/charter|chartering|fixture|fixing|broker|ship|marine|maritime/i.test(e)) { email = e; break; }
      }
      if (!email && innerAll.length > 0) email = innerAll[0];
    }
  }

  if (!email) {
    // 2. Check outer From:/Reply-To: header
    const fromHeaderMatch = text.match(/^(?:From|Reply-To)\s*:\s*(?:[^<\n]*<)?([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/im);
    if (fromHeaderMatch && fromHeaderMatch[1]) {
      email = fromHeaderMatch[1].toLowerCase().trim();
    } else {
      // 3. Prefer email in chartering/broker context
      const charteringEmailMatch = text.match(/(?:charter|chartering|broker|fixture|contact)\s*[/:]?\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/i);
      if (charteringEmailMatch && charteringEmailMatch[1]) {
        email = charteringEmailMatch[1];
      } else {
        // 4. Prefer labelled email: "E-MAIL: xxx@yyy.com"
        const labelledMatch = text.match(/\bE-?MAIL\s*[:\-\s]+([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/i);
        if (labelledMatch && labelledMatch[1]) {
          email = labelledMatch[1].toLowerCase().trim();
        } else {
          const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
          const firstEmail = emails[0];
          if (firstEmail) email = firstEmail.toLowerCase().trim();
        }
      }
    }
  }

  let phone: string | null = null;
  // Prefer phone from inner block (original broker) when this is a forwarded email
  const phoneSearchText = searchText;
  // Enhanced phone regex: include "Office", handle "+ NN" format (space between + and digit)
  const phoneRegex = /(?:Mobile|Office|Phone|WhatsApp|Contact|Tel|Mob)\s*[/\s:*-]*(\+?\s?[\d][\d\s\-().+]{7,24})/gi;
  let phoneMatch;
  while ((phoneMatch = phoneRegex.exec(phoneSearchText)) !== null) {
    let candidate = phoneMatch[1].replace(/\s*\([^)]*$/, "").trim(); // strip incomplete trailing (
    if (isValidPhone(candidate)) {
      // Prefer office phone if available, otherwise use any valid phone
      if (/\boffice\b/i.test(phoneMatch[0])) {
        phone = candidate;
        break; // Office phone takes priority
      } else if (!phone) {
        phone = candidate; // Save first phone as fallback
      }
    }
  }
  // If no labelled phone in inner block, try bare phone numbers in inner block
  if (!phone && innerBlock) {
    const lines = innerBlock.split("\n");
    for (const line of lines) {
      const m = line.match(/(\+\s?\d[\d\s\-().]{6,30}|\d[\d\s\-().]{9,30})/);
      if (m) {
        const candidate = normalizePhone(m[1]);
        if (isValidPhone(candidate)) { phone = candidate; break; }
      }
    }
  }

  // For PIC extraction, use the inner block's signature lines when available
  const sigSearchText = searchText;
  const lines = sigSearchText.split("\n");
  let pic: string | null = null;
  
  // Find signature area — scan up to 12 lines to capture names in longer sig blocks.
  // For forwarded emails: inner block starts with From:/Sent:/To:/Subject: headers which would
  // immediately trigger SIGNATURE_TRIGGERS. Skip those by using last 12 lines of the inner block
  // directly — the real signature of the original broker is at the end of the message.
  // For non-forwarded emails: skip the first 10 lines (email header noise).
  let sigLines: string[];
  if (innerBlock) {
    // For forwarded emails, the original broker's signature is at the END of the inner block
    sigLines = lines.slice(-12);
  } else {
    const sigStart = lines.findIndex((l, idx) => idx >= 10 && SIGNATURE_TRIGGERS.some(p => p.test(l.trim())));
    sigLines = sigStart >= 0 ? lines.slice(sigStart + 1, sigStart + 12) : lines.slice(-12);
  }
  
  // Also scan the whole body for explicit PIC/Contact labels before the sig
  const picLabelMatch = text.match(/\b(?:PIC|Contact(?:\s+Person)?|Attn\.?)\s*[:\-]\s*([A-Z][A-Za-z'\-]+(?:\s+[A-Z][A-Za-z'\-]+){0,3})/i);
  if (picLabelMatch && picLabelMatch[1]) {
    const cand = picLabelMatch[1].trim();
    if (!/^(?:desk|department|office|team|chartering)$/i.test(cand)) pic = cand;
  }

  // Step 1: Prefer explicit titles (Capt., Captain, Mr/Ms, Chief, etc.) — both mixed and ALL-CAPS
  if (!pic) {
    for (const line of sigLines) {
      const t = line.trim();
      // Mixed-case: "Mr. John Smith" or "Capt. John Smith"
      const titleMixed = t.match(/^(?:Capt\.|Captain|Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Chief|Eng\.|Engineer)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i);
      if (titleMixed && titleMixed[1]) { pic = titleMixed[1].trim(); break; }
      // All-caps: "MR. DEEPESH MAJIGAMKAR" or "CAPT. JOHN SMITH"
      const titleUpper = t.match(/^(?:MR\.?|MRS\.?|MS\.?|DR\.?|CAPT\.?|CAPTAIN|ENG\.?|MISS\.?)\s+([A-Z]{2,}(?:\s+[A-Z]{2,}){0,3})$/);
      if (titleUpper && titleUpper[1]) {
        // Convert ALL-CAPS to Title Case
        pic = titleUpper[1].split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
        break;
      }
      // Mixed context: title + ALL-CAPS name in same line (e.g. "MR DEEPESH MAJIGAMKAR")
      const titleUpperInline = t.match(/\b(?:MR\.?|MRS\.?|MS\.?|DR\.?|CAPT\.?)\s+([A-Z]{2,}(?:\s+[A-Z]{2,}){0,3})\b/);
      if (titleUpperInline && titleUpperInline[1] && t.length < 60) {
        pic = titleUpperInline[1].split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
        break;
      }
      // Initials format: "CAPT. K. S. NAIR" or "Mr. J. SMITH" — title followed by initials and last name
      const titleInitials = t.match(/^(?:Capt\.?|Captain|Mr\.?|Mrs\.?|Ms\.?|Dr\.?|Chief|Eng\.?|Miss\.?)\s+((?:[A-Z]\.?\s+){0,3}[A-Z][A-Za-z]{2,})\b/i);
      if (titleInitials && titleInitials[1] && t.length < 80) {
        const name = titleInitials[1].trim().replace(/\s+/g, " ");
        if (name.length >= 3) { pic = name; break; }
      }
    }
  }
  
  // Step 2: If no title found, extract names without titles (capitalized words)
  if (!pic) {
    for (const line of sigLines) {
      const t = line.trim();
      // Match 1-3 capitalized words (first name, middle name, last name)
      const nameMatch = t.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})(?:\s|$)/);
      if (nameMatch && nameMatch[1]) {
        const name = nameMatch[1].trim();
        const isNoisePic = /^(?:the|company|department|office|team|group|shipping|maritime|vessel|email|phone|mobile|address|end|start|mid|late|early|spot|prompt|daily|update|alert|total|balance|circular|summary|dear|sirs|regards|brokers?|only|as|per|and|our|we|please|kindly)\b/i.test(name)
            || /^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(name)
            || /\d/.test(name)
            || (name.split(/\s+/).length === 1 && name.length <= 4)
            || /^(?:MR|MRS|MS|DR|SIR|MA'AM)$/i.test(name.trim());
        if (!isNoisePic && name.length >= 4) { pic = name; break; }
      }
    }
  }

  return { pic, email, phone };
}

function resolveRegion(text: string): string | null {
  if (!text || text.trim().length === 0) return null;
  const upper = text.toUpperCase().replace(/[,.()\[\]]/g, " ");

  // Priority region codes should win over generic country names such as THAILAND
  // NOTE: "SEA" removed — too ambiguous (matches "MED SEA", "BLACK SEA", etc.)
  const priorityRegionCodes = [
    "ECI", "WCI", "WCI1", "E.C.INDIA", "W.C.INDIA", "WCIND", "ECIND",
    "SEASIA", "S.E.ASIA", "TMSEA", "FEASTASIA",
    "MED", "BSEA", "BLSEA", "BALTIC", "NEUROPEAN", "NEUROP", "N.EUROP",
    "ARA", "NTHR", "CONT", "EMED", "WMED",
    "USEC", "USGC", "USG", "USWC", "WCCA", "WCSA", "ECSA", "UPRIVER", "UP RIVER",
    "GOA", "HRA", "COGH", "WWW", "WW", "W.W.", "SPORE", "SSPORE",
    "SCHINA", "NCHINA", "JAPAN", "S.KOREA", "SKOREA", "FAREAST", "F.EAST",
    "AG", "PG", "MEG", "AGULF", "ARAG", "GULF",
  ];

  // Check priority region codes first
  for (const code of priorityRegionCodes) {
    const full = REGION_MAP[code];
    if (!full) continue;
    const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`).test(upper)) return full;
  }

  // Check PORT_TO_REGION BEFORE generic REGION_MAP — gives specific region (e.g. "East Coast India") over generic ("India")
  for (const [portName, region] of Object.entries(PORT_TO_REGION)) {
    const escaped = portName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`).test(upper)) return region;
  }

  // Then check explicit region abbreviations and names from REGION_MAP
  const entries = Object.entries(REGION_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [abbrev, full] of entries) {
    if (priorityRegionCodes.includes(abbrev)) continue;
    // Skip "SEA" when it appears as part of compound region names
    if (abbrev === "SEA" && /\b(?:MED|BLACK|RED|DEAD|NORTH|SOUTH|EAST|WEST|CHINA|ARAB)\s+SEA\b/.test(upper)) continue;
    const escaped = abbrev.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`).test(upper)) return full;
  }

  // Extended country suffix matching (handles "PORT, COUNTRY" or "PORT, AUS" formats)
  const countrySuffix = upper.match(/\b(CHINA|INDIA|INDONESIA|THAILAND|PAKISTAN|BANGLADESH|JAPAN|VIETNAM|PHILIPPINES|BRAZIL|ARGENTINA|AUSTRALIA|MALAYSIA|SOUTH\s+KOREA|KOREA|SENEGAL|NIGERIA|BENIN|GHANA|IVORY\s+COAST|KENYA|MOZAMBIQUE|SOUTH\s+AFRICA|NAMIBIA|UAE|SAUDI|QATAR|KUWAIT|IRAN|IRAQ)\b/);
  if (countrySuffix) {
    const c = countrySuffix[1].replace(/\s+/g, " ");
    if (c === "INDIA") {
      // Try to figure out ECI vs WCI from port name
      const portWords = upper.split(/\s+/);
      for (const w of portWords) {
        if (EAST_COAST_INDIA_PORTS.has(w)) return "East Coast India";
      }
      return "West Coast India";
    }
    if (c === "CHINA") return "China";
    if (c === "INDONESIA") return "Indonesia";
    if (c === "VIETNAM") return "Vietnam";
    if (c === "MALAYSIA") return "South East Asia";
    if (c === "THAILAND") return "South East Asia";
    if (c === "PAKISTAN") return "Pakistan";
    if (c === "BANGLADESH") return "Bangladesh";
    if (c === "JAPAN") return "Japan";
    if (c === "PHILIPPINES") return "Philippines";
    if (c === "BRAZIL") return "East Coast South America";
    if (c === "ARGENTINA") return "East Coast South America";
    if (c === "AUSTRALIA") return "Australia";
    if (c === "SOUTH KOREA" || c === "KOREA") return "South Korea";
    if (c === "SENEGAL" || c === "BENIN" || c === "GHANA" || c === "IVORY COAST") return "West Africa";
    if (c === "NIGERIA") return "West Africa";
    if (c === "KENYA" || c === "MOZAMBIQUE") return "East Africa";
    if (c === "SOUTH AFRICA" || c === "NAMIBIA") return "South Africa";
    if (c === "UAE" || c === "SAUDI" || c === "QATAR" || c === "KUWAIT" || c === "IRAN" || c === "IRAQ") return "Arabian Gulf";
  }

  // Short country abbreviations often seen in broker emails: AUS, PHI, INDO, KOR
  if (/\bAUS\b/.test(upper)) return "Australia";
  if (/\bPHI\b|\bPHL\b/.test(upper)) return "Philippines";
  if (/\bINDO\b/.test(upper)) return "Indonesia";
  if (/\bKOR\b/.test(upper)) return "South Korea";

  // Compound broker shorthand: "RUSSA BSEA" → Black Sea, "AG GULF" → Arabian Gulf, etc.
  // Scan all words in the text for region code hits
  const words = upper.split(/[\s,\/\-]+/);
  for (const w of words) {
    if (w.length < 2) continue;
    if (priorityRegionCodes.includes(w)) {
      const full = REGION_MAP[w];
      if (full) return full;
    }
  }
  // Also try consecutive 2-word combos for compound codes like "MED SEA", "BLACK SEA"
  for (let i = 0; i < words.length - 1; i++) {
    const combo = `${words[i]} ${words[i + 1]}`;
    if (REGION_MAP[combo]) return REGION_MAP[combo];
  }

  // NO HALLUCINATION: If no explicit region found, return null
  return null;
}

function resolvePort(text: string): string {
  let cleaned = normalizePortText(text);
  // Remove common broker prefixes like APS, DEL, DELY that may prefix ports
  cleaned = cleaned.replace(/^(?:APS|A\.P\.S\.?|DEL|DELY|DELY:?|REDEL|RE-DEL)\s+[:\-]?\s*/i, "");
  // Strip leading prepositions like "AT KANDLA" → "KANDLA", "IN MUMBAI" → "MUMBAI"
  cleaned = cleaned.replace(/^(?:AT|IN|FOR|TO|FROM)\s+/i, "");
  const upper = cleaned.toUpperCase();
  // Try exact match first
  if (PORT_ABBREVS[upper]) return PORT_ABBREVS[upper];
  // Try with spaces replaced (e.g., "CAM PHA" → "CAMPHA")
  const compact = upper.replace(/\s+/g, "");
  if (PORT_ABBREVS[compact]) return PORT_ABBREVS[compact];
  return cleaned;
}

function cleanBrokerLocation(text: string | null): string | null {
  if (!text) return null;
  const cleaned = text
    .replace(/\b\d+\s*(?:SP|P|SB|PORTS?)\b/gi, " ")
    .replace(/\b(?:LOAD(?:ING)?|DISCH(?:ARGE)?|DEL(?:IVERY)?|RE-?DEL(?:IVERY)?|RE-?DELY|DELY|DELY:?|PORT|AREA|RANGE|DEL:?)\b/gi, " ")
    .replace(/\b(?:INTENTION|INTENT|ABT|ABOUT|CHOPT|OO|DLOSP|APS|AFS|TIP|PLEASE|PLS|AS FOLLOWS|AS PER|PPSE|PROPOSE|PROPOSED|SUIT|KINDLY|SEE BELOW|AS BELOW)\b/gi, " ")
    .replace(/[()*:\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || cleaned.length <= 2) return null;
  return cleaned;
}

// Resolve a port name that may include a leading region code prefix like "AG INT KUWAIT"
// Returns the specific port portion (e.g. "Kuwait") when possible, else the full text.
function stripRegionPrefix(raw: string): string {
  // Detect "REGION [INT|AREA]? SPECIFIC_PORT" patterns (e.g. "AG INT KUWAIT", "ECI VIZAG", "MED MARSEILLE")
  const regionPrefixRe = /^(?:AG|PG|MEG|MED|BSEA|BLSEA|ECI|WCI|WCIND|ECIND|WAFR|EAFR|SAFR|USEC|USGC|SEASIA|FEASTASIA)\s+(?:INT\s+)?(.+)$/i;
  const m = raw.trim().match(regionPrefixRe);
  if (m && m[1]) {
    const specific = m[1].trim();
    // Only use specific port if it looks like a real port name (no prepositions/dates)
    if (!/\b(?:ON|AT|IN|FOR|TO|FROM)\b/i.test(specific) && specific.length <= 40) return specific;
  }
  return raw;
}

function extractRoutePorts(text: string): { load: string | null; discharge: string | null } {
  const normalized = compactForFallback(text);

  // Require mandatory P/SP suffix to avoid matching random numbers like quantities or DWT
  // Handles "1P", "2P", "1SP", "IP" (letter I as stand-in for 1) broker shorthand
  const slashRoute =
    normalized.match(/\b[1-5I]\s*(?:SP|P)\s+([A-Z][A-Z0-9 .'-]+?)\s*\/\s*[1-5I]\s*(?:SP|P)\s+([A-Z][A-Z0-9 .'-]+?)(?=\s+(?:\d{3,6}(?:[X\/]|\s*MT|SHEX|SHINC|FHEX)|LAYCAN|LC|CARGO|COMM|ADCOM)|,|;|$)/i)
    || normalized.match(/\bFROM\s+([A-Z][A-Z0-9 .'-]+?)\s+(?:TO|\/)\s+([A-Z][A-Z0-9 .'-]+?)(?:\s{2,}| LAYCAN| LC | CARGO| COMM|,|;|$)/i);

  if (slashRoute) {
    return {
      load: cleanBrokerLocation(slashRoute[1]),
      discharge: cleanBrokerLocation(slashRoute[2]),
    };
  }

  // Try "PORT A / PORT B" without SP notation — also allow region codes as VC ports
  const simplePorts = normalized.match(/\b([A-Z]{3,})\s*\/\s*([A-Z]{3,})\b(?!\s*(?:DWT|MT|KT))/);
  if (simplePorts) {
    const load = simplePorts[1];
    const discharge = simplePorts[2];
    const loadIsRegion = REGION_MAP[load] !== undefined;
    const dischIsRegion = REGION_MAP[discharge] !== undefined;
    if ((isValidPort(load) || loadIsRegion) && (isValidPort(discharge) || dischIsRegion)) {
      return {
        load: loadIsRegion ? (REGION_MAP[load] ?? load) : resolvePort(load),
        discharge: dischIsRegion ? (REGION_MAP[discharge] ?? discharge) : resolvePort(discharge),
      };
    }
  }

  // "TIANJIN TO PHILIPPINE", "NCHINA TO PHILIPPINE", "CJK TO PHILIPPINE" — direct A TO B route
  // Common in informal numbered-requirement broker emails. Require valid port/region on both sides.
  const directToRoute = normalized.match(
    /\b([A-Z][A-Z\s]{1,25}?)\s+TO\s+([A-Z][A-Z\s]{1,25}?)(?=\s+(?:END|MID|PPT|PROMPT|SPOT|LAYCAN|JULY|AUG|SEP|OCT|NOV|DEC|JAN|FEB|MAR|APR|MAY|JUN|20\d{2})|[,\n;]|$)/i
  );
  if (directToRoute) {
    const rawLoad = directToRoute[1].trim().replace(/\s+IN\s*$/, "").replace(/\s+OPEN\s*$/, "").trim();
    const rawDisch = directToRoute[2].trim();
    const loadIsRegion = REGION_MAP[rawLoad.toUpperCase()] !== undefined;
    const dischIsRegion = REGION_MAP[rawDisch.toUpperCase()] !== undefined;
    if ((isValidPort(rawLoad) || loadIsRegion) && (isValidPort(rawDisch) || dischIsRegion)) {
      return {
        load: loadIsRegion ? (REGION_MAP[rawLoad.toUpperCase()] ?? rawLoad) : resolvePort(rawLoad),
        discharge: dischIsRegion ? (REGION_MAP[rawDisch.toUpperCase()] ?? rawDisch) : resolvePort(rawDisch),
      };
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
  // Pre-check: strip quantity prefix and H'LESS, then try CARGO_ALIASES BEFORE stripping "IN BULK"
  // This lets aliases like "ORE IN BULK" → "Iron Ore" fire correctly.
  const preStrip = raw
    .replace(/^H\s*['']?\s*LESS\s+/i, "")
    .replace(/^\d[\d,.\s]*\s*(?:MT|MTS|METRIC\s*TONS?)\s*/i, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
  const preStripUpper = preStrip.toUpperCase();
  if (CARGO_ALIASES[preStripUpper]) return CARGO_ALIASES[preStripUpper];
  // Also try without trailing parenthetical noise but keep "IN BULK"
  const preStripCore = preStripUpper.replace(/\s+\d{1,2}\s*%.*$/, "").replace(/\s+MOLOO.*$/, "").trim();
  if (CARGO_ALIASES[preStripCore]) return CARGO_ALIASES[preStripCore];

  let cleaned = raw
    // Remove H'LESS/HLESS/H LESS prefix early before other processing
    .replace(/^H\s*['']?\s*LESS\s+/i, "")
    // Combined commodities: SLAG+CLINKER → SLAG/CLINKER
    .replace(/\s*\+\s*/g, "/")
    // Strip quantity prefix if present: "55,000 MT COAL" → "COAL"
    .replace(/^\d[\d,.\s]*\s*(?:MT|MTS|METRIC\s*TONS?)\s*/i, "")
    // Strip known noise suffixes (BULK, BLK are both common in broker text)
    .replace(/\b(?:IN\s+)?(?:BULK|BLK)\b.*$/i, "")
    .replace(/\bSF\s*\d+(?:\.\d+)?\b.*$/i, "")
    .replace(/\b\d{1,2}\s*%.*$/i, "")
    .replace(/\b\d{1,2}\s*PCT.*$/i, "")
    .replace(/\b(?:TOTAL|MOLOO|MOLCO|CHOPT|LOAD|DISCH|LINER|TERMS|TTL)\b.*$/i, "")
    // Strip noise prefixes/words
    .replace(/^(?:OF|IN|FOR)\s+/i, "")
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
  // TCT with cargo: e.g. "1TCT WITH H'LESS BAGGED RICE" or "1TCT WITH BAGGED RICE"
  // cleanCargoName now handles H'LESS removal
  const tctWithNoBlk = segment.match(/\b\d+\s*TCT\b\s*WITH\s+([A-Z0-9'\/.\-\s]{3,80}?)(?:[\n,;]|$)/i);
  if (tctWithNoBlk) {
    const cand = tctWithNoBlk[1].trim();
    const c = cleanCargoName(cand);
    if (c) return c;
  }
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

  // Generic WITH fallback where TCT/TONNAGE/CARGO context exists — extra safety
  if (/\bTCT\b|\bTONNAGE\b|\bCARGO\b/i.test(segment)) {
    const withMatch = segment.match(/\bWITH\s+([A-Z0-9'\/.\-\s]{3,80}?)(?:[\n,;\.|$])/i);
    if (withMatch) {
      let cand = withMatch[1].trim();
      cand = cand.replace(/H'?LESS/gi, "");
      const c = cleanCargoName(cand);
      if (c) return c;
    }
  }

  return null;
}

function parseDuration(text: string): string | null {
  // "ABT 70 DAYS WOG" or "ABT 70 DYS WOG"
  const wogMatch = text.match(/ABT\s+(\d+)\s+(?:DAYS?|DYS?)\s+(?:WOG|WS|EACH)?/i);
  if (wogMatch) return `${wogMatch[1]} days`;

  // "6 + 6 MONTHS" or "3+3 MONTHS" (period with option)
  const addMatch = text.match(/(\d+)\s*\+\s*(\d+)\s*(?:MONTHS?|MOS?)/i);
  if (addMatch) {
    const total = parseInt(addMatch[1]) + parseInt(addMatch[2]);
    return `${addMatch[1]}+${addMatch[2]} months (${total} total)`;
  }

  // "UPTO 3/5 MOS" or "UPTO 3/5 MONTHS"
  const mosMatch = text.match(/UPTO\s+(\d+)\s*\/\s*(\d+)\s*(?:MOS?|MONTHS?)/i);
  if (mosMatch) return `${mosMatch[1]}/${mosMatch[2]} months`;

  const uptoMatch = text.match(/UPTO\s+(\d+)\s*\/\s*(\d+)\s*(MOS?|MONTHS?)/i);
  if (uptoMatch) return `${uptoMatch[1]}/${uptoMatch[2]} months`;

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
    const lineStart = compact.lastIndexOf("\n", match.index ?? 0);
    const lineEnd = compact.indexOf("\n", match.index ?? 0);
    const line = compact.slice(lineStart + 1, lineEnd === -1 ? compact.length : lineEnd);
    if (/\b(?:GRT|GT)\s*\/\s*(?:NRT|NT)\b/i.test(line) || /\b(?:SUEZ|PANAMA)\s+GT\/NT\b/i.test(line)) {
      return { loadRate: null, dischargeRate: null };
    }

    const loadVal = parseInt(match[1], 10);
    const loadTerm = match[2] && match[2] !== "X" ? ` ${match[2]}` : "";
    const dischVal = parseInt(match[3], 10);
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

  const dwtMatch = segment.match(/\b(\d{1,3}(?:[.,]\d{3})*(?:\.\d+)?)\s*(?:T\s*)?(?:DWAT|DWT|DEADWEIGHT)\b/i);
  if (dwtMatch) {
    const maybe = normalizeDwtNumber(dwtMatch[1]);
    if (maybe) fields.dwt = maybe;
  }

  const imoMatch = segment.match(PATTERNS.imo);
  if (imoMatch) fields.imo = imoMatch[1];

  const gtNrtMatch = segment.match(/(?:GRT|GT)\s*\/\s*(?:NRT|NT)\s*[:\-–]*\s*([\d,\.]+)\s*\/\s*([\d,\.]+)/i);
  if (gtNrtMatch) {
    const grtVal = Math.round(parseFloat(gtNrtMatch[1].replace(/,/g, "")));
    const nrtVal = Math.round(parseFloat(gtNrtMatch[2].replace(/,/g, "")));
    if (!isNaN(grtVal) && grtVal > 100) fields.grt = grtVal.toString();
    if (!isNaN(nrtVal) && nrtVal > 100) fields.nrt = nrtVal.toString();
  }

  const grtMatch = segment.match(PATTERNS.grt);
  if (grtMatch) {
    const raw = grtMatch[1].trim().split(/[\n\r]/)[0].trim();
    const v = Math.round(parseFloat(raw.replace(/,/g, "")));
    if (!isNaN(v) && v > 100) fields.grt = fields.grt ?? v.toString();
  }

  const nrtMatch = segment.match(PATTERNS.nrt);
  if (nrtMatch) {
    const raw = nrtMatch[1].trim().split(/[\n\r]/)[0].trim();
    const v = Math.round(parseFloat(raw.replace(/,/g, "")));
    if (!isNaN(v) && v > 100) fields.nrt = fields.nrt ?? v.toString();
  }

  const intTonnageMatch = segment.match(/Int(?:'|’)?l\s+tonnage\s*[:\-\s]*([\d.,]+)\s*GT\s*\/\s*([\d.,]+)\s*NT/i);
  if (intTonnageMatch) {
    const grtVal = Math.round(parseFloat(intTonnageMatch[1].replace(/,/g, "")));
    const nrtVal = Math.round(parseFloat(intTonnageMatch[2].replace(/,/g, "")));
    if (!isNaN(grtVal) && grtVal > 100) fields.grt = fields.grt ?? grtVal.toString();
    if (!isNaN(nrtVal) && nrtVal > 100) fields.nrt = fields.nrt ?? nrtVal.toString();
  }

  const tpcMatch = segment.match(PATTERNS.tpc);
  if (tpcMatch) {
    const v = parseFloat(tpcMatch[1].replace(/,/g, "."));
    if (!isNaN(v) && v > 1 && v < 200) fields.tpc = v.toString();
  }

  // Depth / Draft extraction
  const depthMatch = segment.match(/\b(?:DEPTH(?:\s+MOULDED)?|DRAFT|DRAUGHT)\s*[:\-\/]*\s*(\d+(?:[.,]\d+)?)\s*(?:M|MTS?|FT)?\b/i);
  if (depthMatch) {
    const v = parseFloat(depthMatch[1].replace(",", "."));
    if (!isNaN(v) && v > 1 && v < 100) fields.depth = `${v}m`;
  }

  const loaBeamPair = segment.match(/(?:LOA|LENGTH(?:\s*OVERALL)?|LENGTH\s*O\/?A?)(?:\s*\/\s*(?:BREADTH|BEAM))?\s*[:\-\/]*\s*(\d+(?:[.,]\d+)?)\s*(?:M|MTS?)?\s*\/\s*(\d+(?:[.,]\d+)?)\s*(?:M|MTS?)?/i);
  if (loaBeamPair) {
    const loaVal = parseFloat(loaBeamPair[1].replace(",", "."));
    const beamVal = parseFloat(loaBeamPair[2].replace(",", "."));
    if (!isNaN(loaVal) && loaVal > 5) fields.loa = `${loaVal}m`;
    if (!isNaN(beamVal) && beamVal > 3) fields.beam = `${beamVal}m`;
  }

  if (!fields.loa) {
    const loaMatch = segment.match(PATTERNS.loa);
    if (loaMatch) {
      const v = parseFloat(loaMatch[1].replace(",", "."));
      if (!isNaN(v) && v > 5) fields.loa = `${v}m`;
    }
  }

  if (!fields.beam) {
    const beamMatch = segment.match(PATTERNS.beam);
    if (beamMatch) {
      const v = parseFloat(beamMatch[1].replace(",", "."));
      if (!isNaN(v) && v > 3) fields.beam = `${v}m`;
    }
  }

  // TPC (Tonnes Per Centimetre) — common spec in tonnage offers
  if (!fields.tpc) {
    const tpcMatch = segment.match(/\bTPC\b\s*[:\-\/]?\s*(?:ABT\.?\s*)?(\d+(?:[.,]\d+)?)/i)
      || segment.match(/\b(\d+(?:[.,]\d+)?)\s*TPC\b/i);
    if (tpcMatch) {
      const v = parseFloat(tpcMatch[1].replace(",", "."));
      if (!isNaN(v) && v > 0 && v < 200) fields.tpc = v.toString();
    }
  }

  // DWCC (Deadweight Cargo Capacity) — often different from DWT
  if (!fields.dwcc) {
    const dwccMatch = segment.match(/\bDWCC\s*[:\-\/]?\s*(?:ABT\.?\s*)?([\d,\.]+)/i)
      || segment.match(/\bCARGO\s+CAPACITY\s*[:\-\/]?\s*(?:ABT\.?\s*)?([\d,\.]+)/i)
      || segment.match(/\bDEADWEIGHT\s+CARGO\s*[:\-\/]?\s*([\d,\.]+)/i);
    if (dwccMatch) {
      const v = parseFloat(dwccMatch[1].replace(/,/g, ""));
      if (!isNaN(v) && v >= 1000 && v <= 650000) fields.dwcc = v.toString();
    }
  }

  // Grain capacity - supports multiple formats: 
  // "GRAIN: 77,784.65 CU.M", "GRAIN CAP ABT 75000 CBM", "GRAIN – 77,784.65 CU.M."
  const grainMatch = 
    segment.match(/\bGRAIN\s*[:\-–]\s*([\d,\.]+)\s*(?:CBM|CU\.?M|M3)?/i)
    || segment.match(PATTERNS.grainCap) 
    || segment.match(/GRAIN\s+CAP(?:ACITY)?\s+(?:ABT|ABT\.)\s+([\d,\.]+)\s*(?:CBM|M3)/i);
  if (grainMatch) {
    const raw = grainMatch[1].trim();
    const normalized = raw.replace(/,/g, "").replace(/\s+/g, "");
    const num = parseFloat(normalized);
    if (!isNaN(num) && num > 100 && num < 2000000) fields.grain_capacity = num.toString();
  }

  // Built year line: prefer explicit 4-digit year after BUILT/BLT before falling back to 2-digit style
  if (!fields.built_year) {
    const builtLine = segment.match(/(?:BUILT|BLT|BLT\.)\s*[:\s\/.-]*([^\n]+)/i);
    if (builtLine) {
      const year4Match = builtLine[1].match(/(19|20)\d{2}/);
      if (year4Match) {
        fields.built_year = year4Match[0];
      }
    }
  }

  // Fallback: detect 2-digit built year like (63K/'18/IMABARI) or MV NAME (63K/'18)
  if (!fields.built_year) {
    const shortYearMatch = segment.match(/['\u2019](\d{2})\b/);
    if (shortYearMatch) {
      const yy = parseInt(shortYearMatch[1], 10);
      const currentYY = new Date().getFullYear() % 100;
      const full = yy <= currentYY + 1 ? 2000 + yy : 1900 + yy;
      if (full >= 1970 && full <= new Date().getFullYear() + 1) fields.built_year = String(full);
    }
  }

  // Fallback IMO: if 'IMO' present anywhere and a 7-digit number exists, grab it
  if (!fields.imo) {
    if (/\bIMO\b/i.test(segment)) {
      const seven = segment.match(/(\d{7})/);
      if (seven) fields.imo = seven[1];
    }
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

  // Built year — support '18 (-> 2018), BLT 2015, BUILT:2012
  const builtMatch = segment.match(PATTERNS.builtYear);
  if (builtMatch) {
    let rawYr = builtMatch[1] ?? builtMatch[2] ?? builtMatch[3];
    if (rawYr) {
      rawYr = rawYr.replace(/[\u2019'`]/g, "");
      if (/^\d{2}$/.test(rawYr)) {
        const yy = parseInt(rawYr, 10);
        const currentYY = new Date().getFullYear() % 100;
        const full = yy <= currentYY + 1 ? 2000 + yy : 1900 + yy;
        if (full >= 1970 && full <= new Date().getFullYear() + 1) fields.built_year = String(full);
      } else if (/^\d{4}$/.test(rawYr)) {
        const yr = parseInt(rawYr, 10);
        if (yr >= 1970 && yr <= new Date().getFullYear() + 1) fields.built_year = String(yr);
      }
    }
  }

  // Flag — must not be a vessel type abbreviation or vessel specification term
  const FLAG_BLACKLIST = new Set([
    "SDBC", "SMX", "UMX", "PMX", "KMX", "SMAX", "UMAX", "KMAX", "HMAX",
    "SUPRAMAX", "ULTRAMAX", "PANAMAX", "KAMSARMAX", "HANDYMAX", "HANDYSIZE",
    "CAPESIZE", "CAPE", "VLCC", "AFRAMAX", "SUEZMAX", "BULK", "CARRIER",
    "BULK CARRIER", "TANKER", "GAS CARRIER", "CONTAINER",
    "DWT", "IMO", "GRT", "NRT", "LOA", "BEAM", "TPC", "BUILT", "BLT",
    "OPEN", "SPOT", "PROMPT", "VESSEL", "MV", "M/V",
  ]);
  function isValidFlagValue(flag: string): boolean {
    const upper = flag.trim().toUpperCase();
    if (FLAG_BLACKLIST.has(upper)) return false;
    if (/^\d/.test(upper)) return false;
    if (upper.length > 30) return false;
    return true;
  }

  const flagMatch = segment.match(PATTERNS.flag);
  if (flagMatch) {
    let flag = flagMatch[1].trim();
    // Ensure we don't capture multiple lines or vessel names
    flag = flag.split('\n')[0].trim();
    if (flag && !/^(?:MV|VESSEL|M\/V)\b/i.test(flag) && isValidFlagValue(flag)) fields.flag = flag;
  } else {
    const fmatch = segment.match(/\bFLAG\b[:\-\s]*([A-Z][A-Z\s]+?)(?=\s+(?:POR|OFF|IMO|CALL|TEL|FAX|CLASS|BUILT|BLT|MOBILE|PHONE|WHATSAPP|CONTACT|EMAIL|E-MAIL|$)|[\/\n,]|$)/im);
    if (fmatch) {
      let flag = fmatch[1].trim();
      flag = flag.split(/[\n,]/)[0].trim();
      if (flag && !/^(?:MV|VESSEL|M\/V)\b/i.test(flag) && isValidFlagValue(flag)) fields.flag = flag;
    } else {
      // Standalone: "LIBERIA FLAG" or "CYPRUS FLAG" on its own line
      const segmentLines = segment.split('\n');
      for (const line of segmentLines) {
        const cleanLine = line.trim();
        const standaloneFlagMatch = cleanLine.match(/^([A-Z][A-Z\s]*)\s+FLAG\s*$/i);
        if (standaloneFlagMatch) {
          const flagText = standaloneFlagMatch[1].trim();
          // Only use if it's a reasonable length (1-3 words, no numbers)
          if (flagText.split(/\s+/).length <= 3 && !/\d/.test(flagText)) {
            fields.flag = flagText;
            break;
          }
        }
      }
    }
  }

  // ── New optional Tonnage fields ─────────────────────────────────────────────

  // LBP (Length Between Perpendiculars)
  const lbpMatch = segment.match(/\bLBP\s*[:\-\/]*\s*(\d+(?:[.,]\d+)?)\s*(?:M|MTS?)?\b/i);
  if (lbpMatch) {
    const v = parseFloat(lbpMatch[1].replace(',', '.'));
    if (!isNaN(v) && v > 5) fields.lbp = `${v}m`;
  }

  // Draft (explicit, as separate from depth)
  if (!fields.draft) {
    const draftMatch = segment.match(/\bDRAFT\s*[:\-\/]*\s*(\d+(?:[.,]\d+)?)\s*(?:M|MTS?)?\b/i)
      || segment.match(/\bDRAUGHT\s*[:\-\/]*\s*(\d+(?:[.,]\d+)?)\s*(?:M|MTS?)?\b/i);
    if (draftMatch) {
      const v = parseFloat(draftMatch[1].replace(',', '.'));
      if (!isNaN(v) && v > 0.5 && v < 30) fields.draft = `${v}m`;
    }
  }

  // Class notation (BV, NK, ABS, LR, GL, DNV, RS, CC, KR, IRS, etc.)
  const classMatch = segment.match(/\bCLASS(?:IFICATION)?\s*[:\-\/]*\s*([A-Z][A-Z0-9\s\+\-\/\.]{1,40}?)(?=\n|,|\s{2,}|$)/im)
    || segment.match(/\bCLASS\s*[:\-]?\s*([A-Z]{1,6}(?:\s+[A-Z0-9]+)*)\s*(?:\n|$)/im);
  if (classMatch) {
    const cls = classMatch[1].trim().split(/[\n,]/)[0].trim();
    if (cls.length >= 2 && cls.length <= 50) fields.class_notation = cls;
  }

  // Holds / Hatches: "5 HO/5 HA", "HO/HA - 5/5", "HO/HA: 5/5", "HOLDS: 5 / HATCHES: 5", "5HO/5HA"
  const holdsHatchesMatch = 
    segment.match(/\bHO\s*\/\s*HA\s*[-–:]\s*(\d{1,2})\s*\/\s*(\d{1,2})/i)  // "HO/HA - 5/5"
    || segment.match(/\b(\d{1,2})\s*HO(?:LDS?)?\s*\/\s*(\d{1,2})\s*HA(?:TCHES?)?\b/i)  // "5HO/5HA"
    || segment.match(/\bHOLDS?\s*[:\-\/]*\s*(\d{1,2})[^\n]*HATCHES?\s*[:\-\/]*\s*(\d{1,2})/i);  // "HOLDS: 5"
  if (holdsHatchesMatch) {
    fields.holds = holdsHatchesMatch[1];
    fields.hatches = holdsHatchesMatch[2];
  } else {
    const holdsOnly = segment.match(/\bHOLDS?\s*[:\-\s]+([\d]+)/i);
    if (holdsOnly) fields.holds = holdsOnly[1];
    const hatchesOnly = segment.match(/\bHATCHES?\s*[:\-\s]+([\d]+)/i);
    if (hatchesOnly) fields.hatches = hatchesOnly[1];
  }

  // Cranes - extract just the specification part, not the label
  const cranesMatch1 = segment.match(/\b(\d{1,2})\s*[Xx]\s*(\d{1,3})\s*(?:MT|T)\s*CRANES?\b/i);
  const cranesMatch2 = segment.match(/\bCRANES?\s*[:\-\s]*(\d{1,2}\s*[Xx]\s*\d{1,3}\s*(?:MT|T)?[^\n]{0,30})/i);
  const cranesMatch3 = segment.match(/\bCRANES?\s*[:\-\s]+(\d{1,2})\b/i);
  if (cranesMatch1) {
    fields.cranes = `${cranesMatch1[1]} X ${cranesMatch1[2]}T`;
  } else if (cranesMatch2) {
    const raw = cranesMatch2[1].trim().replace(/\n.*/s, '').trim();
    fields.cranes = raw.length <= 60 ? raw : null;
  } else if (cranesMatch3) {
    fields.cranes = cranesMatch3[1];
  }

  // Grabs
  const grabsMatch = segment.match(/\bGRABS?\s*[:\-\s]*(\d{1,2}\s*(?:[Xx]\s*\d{1,2})?[^\n]{0,40})/i);
  if (grabsMatch) {
    const raw = grabsMatch[1].split(/\n/)[0].trim();
    if (raw.length <= 60) fields.grabs = raw;
  }

  // Speed (knots) — supports: "SPEED: 13 KTS", "ABOUT 13.0 KNOTS ON ABOUT 24.0 MT/D", 
  // "LADEN: 13.5 KNOTS", "SPEED / CONS: 13.5 KNOTS ON 24 MT/DAY VLSFO"
  const speedMatch = 
    segment.match(/\bSPEED\s*[:\-\/]*\s*(?:ABT\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:KTS?|KNOTS?)\b/i)
    || segment.match(/\bECO\s*SPEED\s*[:\-\/]*\s*(\d+(?:[.,]\d+)?)\s*(?:KTS?|KNOTS?)?\b/i)
    || segment.match(/\bABOUT\s+(\d+(?:[.,]\d+)?)\s*KNOTS?\b/i)
    || segment.match(/\bLADEN\s*[:\-]?\s*(?:ABT\.?\s*|ABOUT\s+)?(\d+(?:[.,]\d+)?)\s*(?:KTS?|KNOTS?)\b/i)
    || segment.match(/\bBALLAST\s*[:\-]?\s*(?:ABT\.?\s*|ABOUT\s+)?(\d+(?:[.,]\d+)?)\s*(?:KTS?|KNOTS?)\b/i)
    || segment.match(/\bSPEED\/CONS(?:UMPTION)?\s*[:\-]*\s*(?:ABT\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:KTS?|KNOTS?)\b/i);
  if (speedMatch) {
    const v = parseFloat(speedMatch[1].replace(',', '.'));
    if (!isNaN(v) && v > 1 && v < 30) fields.speed = `${v} kts`;
  }

  // Consumption (fuel) — supports: "CONS: 24.0 MT/DAY", "24.0 MT/D VLSFO", 
  // "ABOUT 24.0 MT/D VLSFO", "ON ABOUT 24.0 MT/D VLSFO PLUS 0.20 MT/D LSMGO"
  const consMatch = 
    segment.match(/\bCONS(?:UMPTION)?\s*[:\-\/]*\s*(?:ABT\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:MT\s*\/\s*(?:DAY|D)|MT\/DAY|MT\s*PD|MTPD|T\/D)\b/i)
    || segment.match(/\bON\s+(?:ABT\.?\s*|ABOUT\s+)?(\d+(?:[.,]\d+)?)\s*(?:MT\s*\/\s*(?:DAY|D)|MT\/DAY|MT\/D)\s*(?:VLSFO|LSMGO|HSFO|IFO|HFO|MGO|MDO|FUEL|OIL)?\b/i)
    || segment.match(/\b(\d+(?:[.,]\d+)?)\s*(?:MT\s*\/\s*(?:DAY|D)|MT\/DAY|MT\s*PD|MTPD)\s*(?:VLSFO|LSMGO|HSFO|IFO|HFO)\b/i)
    || segment.match(/\b(\d+(?:[.,]\d+)?)\s*(?:MT\s*\/\s*DAY|MT\/DAY|MT\s*PD|MTPD)\b/i);
  if (consMatch) {
    const v = parseFloat(consMatch[1].replace(',', '.'));
    if (!isNaN(v) && v > 0 && v < 200) fields.consumption = `${v} MT/DAY`;
  }

  // Gear type (GEARLESS, GEARED, DERRICKS, etc.)
  const gearMatch = segment.match(/\bGEAR(?:LESS|ED)?\b/i)
    || segment.match(/\bDERRICKS?\s*[:\-\s]*(\d[^\n]{0,30})/i);
  if (gearMatch) {
    fields.gear = gearMatch[0].trim().split(/\n/)[0].trim().substring(0, 60);
  }

  // Registry port (port of registry) - supports: "PORT OF REGISTRY:", "POR :", "REGISTRY PORT:"
  const registryMatch = 
    segment.match(/\bPORT\s+OF\s+REGISTRY\s*[:\-\/]*\s*([A-Z][A-Za-z\s]+?)(?=[\n,;]|$)/im)
    || segment.match(/\bREGISTRY\s+PORT\s*[:\-\/]*\s*([A-Z][A-Za-z\s]+?)(?=[\n,;]|$)/im)
    || segment.match(/\bPOR\s*[:\-]\s*([A-Z][A-Za-z\s]+?)(?=[\n,;\s]+(?:OFF|IMO|CALL|CLASS|FLAG)|$)/im)
    || segment.match(/\bFLAG\b[^\n]*\bPOR\s*[:\-]?\s*([A-Z][A-Za-z\s]+?)(?=[\n,;]|\bOFF\b|$)/im);
  if (registryMatch) {
    const rp = registryMatch[1].trim().split(/[\n,]/)[0].trim();
    if (rp.length >= 2 && rp.length <= 40 && !/^\d/.test(rp)) fields.registry_port = rp;
  }

  // Builder / shipyard
  const builderMatch = segment.match(/\bBUILDER\s*[:\-\/]*\s*([A-Z][A-Za-z0-9\s&\-\.,']+?)(?=[\n;,]|$)/im)
    || segment.match(/\bSHIPYARD\s*[:\-\/]*\s*([A-Z][A-Za-z0-9\s&\-\.,']+?)(?=[\n;,]|$)/im)
    || segment.match(/\bBUILT\s+(?:BY|AT)\s*[:\-\/]*\s*([A-Z][A-Za-z0-9\s&\-\.,']+?)(?=[\n;,]|$)/im);
  if (builderMatch) {
    const bld = builderMatch[1].trim().split(/\n/)[0].trim();
    if (bld.length >= 3 && bld.length <= 80) fields.builder = bld;
  }

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
const HARD_SEPARATORS = /\n[-─—*=+]{4,}\n/g;

// Patterns that strongly indicate start of a new cargo/tonnage block
function startsNewBlock(line: string): boolean {
  const t = line.trim().toUpperCase();
  if (t.length < 5) return false;

  // Numbered bullets: "1." "1)" "A." "A)" "AA)" "BB)"
  if (/^[A-Z]{1,3}[.)]\s+/.test(t)) return true;
  if (/^\d+\.\s+/.test(t)) return true;
  if (/^\d+\)\s+/.test(t)) return true;

  // ACCT line (TC circular)
  if (/^ACCT\s+/.test(t)) return true;

  // A/C line
  if (/^A\/C\s+/.test(t)) return true;

  // MV / M/V vessel name, including optional dot after MV and open position markers
  if (/^(?:M\/[TV]|M[TV])(?:[\/\.]?)\s+[A-Z]/.test(t)) return true;
  if (/^(?:M\/[TV]|M[TV])(?:[\/\.]?)\s+[A-Z].*\bOPEN\b/i.test(line)) return true;

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
    const isBlockStart = startsNewBlock(line);
    if (isBlockStart && current.join("").trim().length > 30) {
      blocks.push(current.join("\n").trim());
      current = [];
    }
    if (isBlockStart) blockCount++;
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

function normalizePortText(text: string): string {
  return text
    .trim()
    .replace(/[;,\/]+$/g, "")
    .replace(/\s*[;,\/]\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLeadTonnageHeader(segment: string): boolean {
  const upper = segment.toUpperCase();
  const cleaned = upper.trim().replace(/^[\-•\*\s]+/, "");
  const hasOpenKeyword = /\bOPEN\b|\bO\/A\b|\bOPENING\b|\bWILL\s+OPEN\b/i.test(cleaned);
  const hasOpenContext = /\bINDIA\b|\bOPEN\s*PORT\b|\bO\/A\b|\bSPOT\b|\bPROMPT\b|\b\d{1,2}(?:ST|ND|RD|TH)?\s*[-–]\s*\d{1,2}/i.test(cleaned);
  return hasOpenKeyword && hasOpenContext;
}

function isVesselProfileBlock(segment: string): boolean {
  const upper = segment.toUpperCase();
  const hasVesselHeading = /^(?:VESSEL\s*:|M\/?V\b|MV\b)/i.test(segment.trim());
  const hasTechnicalFields = /\b(?:DWT|IMO|GRT|NRT|LOA|BEAM|BUILT|BLT|FLAG|CLASS|SUMMER|WINTER|GRAIN\s+CAPACITY|TPC|HATCH|CRANE)\b/i.test(upper);
  return hasVesselHeading && hasTechnicalFields;
}

function mergeTonnageLeadSegments(segments: string[]): string[] {
  const merged: string[] = [];
  let i = 0;
  while (i < segments.length) {
    const current = segments[i];
    const next = segments[i + 1];
    if (
      next &&
      current.length < 140 &&
      isLeadTonnageHeader(current) &&
      isVesselProfileBlock(next)
    ) {
      merged.push((current + "\n" + next).trim());
      i += 2;
      continue;
    }
    merged.push(current);
    i += 1;
  }
  return merged;
}

function segmentEmail(emailText: string, includeTechnical = false): string[] {
  const normalizedText = normalizeEmailText(emailText);
  const result: string[] = [];

  // Step 1: Split forwarded email chains
  // For Outlook-style forwarded emails (From:/Sent:/Subject: headers), use findForwardedMessageStart
  // to extract only the inner broker's content (which contains the vessel data).
  // The outer email is typically just a forwarding cover note and contains no vessel records.
  const forwardedParts = splitForwardedChains(normalizedText);
  let workingParts: string[];
  if (forwardedParts.length > 1) {
    workingParts = forwardedParts;
  } else {
    const innerStart = findForwardedMessageStart(normalizedText);
    if (innerStart > 0) {
      // Use only the inner forwarded email body for vessel segmentation
      workingParts = [normalizedText.slice(innerStart)];
    } else {
      workingParts = [normalizedText];
    }
  }

  for (const part of workingParts) {
    // Step 2: Split on hard dash separators
    const hardSplit = part.split(HARD_SEPARATORS);

    for (const seg of hardSplit) {
      const trimmed = seg.trim();
      if (trimmed.length < 20) continue;

      // Step 2.5: Split on "--- SECTION HEADER ---" or "=== SECTION ===" style lines
      // e.g. "--- TONNAGE POSITIONS ---" and "--- CARGO VOYAGE CHARTER REQ (VC) ---"
      // These use 2-3 dashes (not 4+) so they don't hit HARD_SEPARATORS
      const sectionHeaderRe = /\n---+\s+[A-Z][^\n]*---+[ \t]*(?=\n)/g;
      const sectionHeaderSplits = trimmed.split(sectionHeaderRe).filter(s => s.trim().length > 20);
      const subParts = sectionHeaderSplits.length > 1 ? sectionHeaderSplits : [trimmed];

      for (const subPart of subParts) {
        const subTrimmed = subPart.trim();
        if (subTrimmed.length < 20) continue;

        // Step 3: Check for ACCT/A/C multi-block pattern
        const acctCount = (subTrimmed.match(/^(?:ACCT|A\/C)\s+/gim) ?? []).length;
        if (acctCount >= 2) {
          result.push(...splitByAcCt(subTrimmed));
          continue;
        }

        // Step 4: Check for bullet / numbered block pattern
        const bulletBlocks = splitByBullets(subTrimmed);
        if (bulletBlocks.length > 1) {
          result.push(...bulletBlocks);
          continue;
        }

        result.push(subTrimmed);
      }
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

  const merged = mergeTonnageLeadSegments(deduped);
  const filtered = merged.filter(segment => includeTechnical || !isTechnicalProfileSegment(segment));
  return filtered.length > 0 ? filtered : (merged.length > 0 ? merged : [normalizedText]);
}

function normalizeVesselName(name: string): string {
  let s = String(name || "");
  // Remove trailing advertising like "- OPEN AT ...", "OPEN AT ...", "O/A ..."
  s = s.replace(/[-–—]\s*OPEN\b[\s\S]*$/i, "");
  s = s.replace(/\bOPEN(?:\s+AT|\s+PORT|ING)?\b[\s\S]*$/i, "");
  s = s.replace(/\bO\/A\b[\s\S]*$/i, "");
  // Then perform normal cleaning
  return s
    .replace(/[“”"']/g, "")
    .replace(/\bMV\.?\b|\bM\/V\b|\bVESSEL\b/gi, "")
    .replace(/[^A-Z0-9 ]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function hasLeadingVesselHeader(segment: string): boolean {
  const firstNonEmptyLines = segment
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 2)
    .join(" ");
  return /^(?:M\/V|MV|VESSEL)\b/i.test(firstNonEmptyLines) || /\bM\/?V\.?\s+[A-Z]/i.test(firstNonEmptyLines);
}

function isValidVesselName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  const invalidTerms = /\b(?:DRAFT|DEADWEIGHT|ATTESTATION|TPC|LOA|BEAM|IMO|FLAG|NRT|GRT|TYPE|VESSEL\s*TYPE|ACCOUNT|CARGO|REQUEST|OFFER)\b/i;
  if (invalidTerms.test(name)) return false;
  if (/\bOPEN\b|\bO\/A\b/i.test(name)) return false;
  if (/\d+\.\d+/.test(name)) return false;
  if (!/[A-Z]/.test(name)) return false;
  if (name.trim().length < 3) return false;
  // Reject fuel types extracted as vessel names
  if (/^(?:LSMGO|VLSFO|HSFO|LSFO|LSGO|MGO|MDO|DMO|IFO|HFO|BUNKER|FUEL|SCRUBBER)$/i.test(name.trim())) return false;
  // Reject common operational words mistaken for vessel names
  if (/^(?:COMBI|PROMPT|SPOT|END|TRADING|DAILY|TOTAL|BALANCE|SUMMARY|CIRCULAR|UPDATE|ALERT|NOTICE)$/i.test(name.trim())) return false;
  // Reject if it looks like a person name title: "MR JOHN SMITH"
  if (/^(?:MR|MRS|MS|DR|CAPT|CAPTAIN)\b/i.test(name.trim()) && name.split(/\s+/).length >= 3) return false;
  return true;
}

function extractVesselNameFromTechnicalSegment(segment: string): string | null {
  const mvMatch =
    segment.match(PATTERNS.mvName) ||
    segment.match(/\bMV\.?\s*["']?([A-Z][A-Z0-9\s.'-]+?)["']?\b/i) ||
    segment.match(/\bVESSEL\s*[:\-]?\s*["']?([A-Z][A-Z0-9\s.'-]+?)["']?\b/i) ||
    segment.match(/^(?:M\/?V|MV|VESSEL)\.?\s+["']?([A-Z][A-Z0-9\s.'-]+?)["']?\b/i);
  if (mvMatch && mvMatch[1]) return mvMatch[1].trim();
  
  // Fallback: look for vessel name as first non-empty line (common in technical blocks)
  // Check first 10 non-empty lines to handle segments that start with company header noise
  // (e.g. "Rieck + Petersen GmbH\nPhone: +49...\n\nULTRA SILVA") before the vessel name.
  const allLines = segment.split('\n');
  const firstFewLines = allLines.slice(0, 10).map(l => l.trim()).filter(l => l.length > 0).slice(0, 6);
  
  // List of common noise words and operational terms that are NOT vessel names
  // Expanded to include: ADA (trailing broker/contact info), DAILY, and other operational text
  const commonNoiseTerms = /^(?:DAILY|ADA|IDLE|WORKING|SPEED|CONS|BALLAST|LADEN|PORT|CONSUMPTION|ANCHORAGE|FLAGSHIP|ALERT|NOTICE|UPDATE|INFORMATION|DETAILS|TECHNICAL|SPECIFICATIONS|PERFORMANCE|DATA|BLOCK|HATCH|CARGO|HOLDS|CLASS|FLAG|LIBERIA|CYPRUS|PANAMA|MARSHALL|MALTA|SIERRA|IMO|GRT|LOA|BEAM|GRAIN|DWT|ECO|SCRUBBER|CO2|FITTED|CRANES|DERRICKS|VESSEL|INCLUD|HANDLING|CONTAINER|GENERAL|SPECIAL|FEATURES|MODIFICATIONS|NOTES|REMARKS|SELLER|BUYER|BROKER|AGENT|PHONE|EMAIL|OFFICE|MOBILE|WHATSAPP|CONTACT|REQUEST|OFFER|LISTED|AVAILABLE|LSMGO|VLSFO|HSFO|LSFO|LSGO|MGO|MDO|DMO|IFO|HFO|BUNKER|FUEL|COMBI|TRADING|PROMPT|SPOT|SUMMARY|CIRCULAR|END|BALANCE|TOTAL)$/i;
  
  for (const line of firstFewLines) {
    // Match capital letter sequences that look like vessel names (2-4 words, no numbers except for size specs)
    if (line 
        && /^[A-Z][A-Z0-9\s.'-]{2,50}$/.test(line) 
        && !commonNoiseTerms.test(line)
        && line.split(/\s+/).length <= 4
        && !line.match(/^\d{1,5}/)
        && !line.includes(':')) {
      return line;
    }
  }
  
  return null;
}


function isTechnicalProfileSegment(segment: string): boolean {
  const upper = segment.toUpperCase();
  const hasCargoHoldPhrase = /\bCARGO\s+HOLDS?\b/i.test(upper);
  // Keep any block that clearly contains opening, trading, or cargo information.
  const strongTradingSignals = /\b(?:LOAD(?:ING)?\s*PORT|DISCHARGE\s*PORT|POL|POD|DEL(?:IVERY)?|REDEL(?:IVERY)?|LAYCAN|OPEN(?:\s+AT|\s+PORT|\s+ING)?(?!\s+SEA)|O\/A|CARGO(?:\s*[:\-\s]|\s+(?:PORT|DISCHARGE|QUANTITY|QTY|LOAD|UNLOAD|CHARGES?|COMMODITY|TYPE|DETAILS))|TRY\s+ANY|TCT|SPOT|PROMPT|HIRE)\b/i;
  const weakTradingSignals = /\b(?:ACCOUNT|CHARTERER|RATE|FREIGHT|QUANTITY|PERIOD|OPEN|CARGO|TRY|HIRE|TCT|SPOT|PROMPT)\b/i;
  const technicalNoise = /\b(?:CHARTERERS?'?\s+ACCOUNT|OPEN\s+SEA|PERIOD\s+OF\s+\d+\s+CONSECUTIVE\s+HOURS|CARGO\s+WORK|CARGO\s+HOLDS?)\b/i;
  const hasTradingSignals = strongTradingSignals.test(segment) || (weakTradingSignals.test(segment) && !technicalNoise.test(segment));
  if (hasTradingSignals && !hasCargoHoldPhrase) {
    return false;
  }

  const technicalSignals = [
    /\bDWT\b/,
    /\bDEADWEIGHT\b/,
    /\bGRT\b/,
    /\bNRT\b/,
    /\bLOA\b/,
    /\bBEAM\b/,
    /\bCRANES?\b/,
    /\bGRABS?\b/,
    /\bGRAIN\s+CAPACITY\b/,
    /\bSPEED\b/,
    /\bCONSUMPTION\b/,
    /\bFLAG\b/,
    /\bCLASS\b/,
    /\bIMO\b/,
    /\bBUILT\b/,
    /\bBLT\b/,
  ];

  const technicalCount = technicalSignals.reduce(
    (count, re) => count + (re.test(upper) ? 1 : 0),
    0
  );
  if (technicalCount < 2) return false;

  const hasTradingInfo = /\b(?:ACCOUNT|CHARTERER|RATE|FREIGHT|QUANTITY|LOAD(?:ING)?\s*PORT|DISCHARGE\s*PORT|POL|POD|DELIVERY|REDELIVERY|LAYCAN|OPEN|CARGO|TRY|PERIOD|HIRE|TCT|SPOT|PROMPT)\b/i.test(segment);
  const hasVesselHeading = /^(?:M\/V|MV|VESSEL)\b/i.test(segment.trim()) || /\bM\/?V\.?\s+[A-Z]/i.test(segment);
  const hasTechnicalSummaryBlocks = /\bLADEN\b|\bBALLAST\b|\bECO\s+SPEED\b|\bWRKNG\s+CRANES?\b|\bSPEED\/CONSUMPTION\b|\bGRAIN\s+CAPACITY\b|\b(?:GRT|GT)\s*\/\s*(?:NRT|NT)\b/.test(upper);
  const hasTechnicalFuelLines = /\b(?:VLSFO|LSMGO|BUNKER|CONSUMPTION|MT PD|MT\/PD|MT\s*PD|CST|CBM|MTS?)\b/i.test(upper);
  const hasTechnicalDwtProfile = /\bDWT\s+ON\b/i.test(upper) || (/\bDWT\b/i.test(upper) && /\bIMO\b/i.test(upper));
  const hasTechnicalProfileSummary = hasTechnicalSummaryBlocks || hasTechnicalDwtProfile;
  const technicalTradingNoise = /\b(?:CHARTERERS?'?\s+ACCOUNT|OPEN\s+SEA|PERIOD\s+OF\s+\d+\s+CONSECUTIVE\s+HOURS|CARGO\s+WORK|CARGO\s+HOLDS?)\b/i;
  const hasCargoPortOrCharter = /\b(?:ACCOUNT|CHARTERER|RATE|FREIGHT|QUANTITY|LOAD(?:ING)?\s*PORT|DISCHARGE\s*PORT|POL|POD|DELIVERY|REDELIVERY|LAYCAN|OPEN(?:\s+AT)?|O\/A|CARGO(?!\s+HOLDS?)|TRY|PERIOD|HIRE|TCT|SPOT|PROMPT)\b/i.test(segment)
    && !technicalTradingNoise.test(segment);
  const hasTechnicalShipSpecs = /\b(?:DWT|IMO|GRT|NRT|LOA|BEAM|BLT|BUILT|CLASS|FLAG|GRAIN\s+CAPACITY|SPEED|CONSUMPTION|CST|CBM|TPC|HATCH)\b/.test(upper);
  const hasVesselHeader = hasLeadingVesselHeader(segment);
  const hasBoilerplateHeader = /\b(?:GOOD\s+DAY|PLEASE\s+PROPOSE|PLEASE\s+ADVISE|PLEASE\s+SEND|FROM\s+[A-Z]|MOB|FAX|TEL|PHONE|EMAIL|THANKS|REGARDS)\b/i.test(segment);
  const hasNonActionableHeaders = hasBoilerplateHeader && !hasTechnicalShipSpecs && !hasTechnicalProfileSummary && !hasCargoPortOrCharter;

  if (hasTechnicalProfileSummary && !hasCargoPortOrCharter) return true;
  if (hasTechnicalFuelLines && !hasCargoPortOrCharter && technicalCount >= 2) return true;
  if (hasVesselHeader && hasTechnicalShipSpecs && !hasCargoPortOrCharter && !/\bOPEN\b|\bO\/A\b|\bOPEN\s+AT\b|\bSPOT\b|\bPROMPT\b/i.test(upper)) return true;
  if (hasTechnicalSummaryBlocks && hasTechnicalShipSpecs && !hasCargoPortOrCharter) return true;
  if (hasNonActionableHeaders) return true;

  return false;
}

// ─── Type Detection ───────────────────────────────────────────────────────────

const TONNAGE_KW = [
"open","opening","spot","prompt",
"tonnage","available","dwt",
"built","blt","sdwt","dwcc",
"geared","gearless","grabs",
"ballast","eta","last cargo",
"flag","class","looking for cargo",
"vessel","grt","nrt",
"cranes","derricks",
"open for orders",
"available position",
"open for"
];

const VC_KW = [
"cargo",
"stem",
"account",
"charterers",
"rate_per_mt",
"freight",
"lumpsum",
"laycan",
"loading",
"discharge_port",
"discharge",
"load port",
"demurrage",
"despatch",
"liner terms",
"fiost",
"fios",
"filo",
"gencon",
"quantity",
"moloo",
"in bulk",
"tolerance",
"chopt",
"intention",
"1 safe berth",
"sbsa",
"pol",
"pod",
"cargo quantity",
"safe berth",
"voyage charter",
"voyage_charter",
"fio",
"shinc",
"shex",
"pwwd",
"dap",
"despatch",
"stowage factor",
"stow factor"
];

const TC_KW = [
"time_charter",
"trip_time_charter",
"period",
"hire",
"rate_per_day",
"daily hire",
"delivery",
"redelivery",
"on hire",
"off hire",
"basis delivery",
"months",
"worldwide_trading",
"nype",
"hire rate",
"vessel wanted",
"period of",
"vessel requirements",
"vessel size",
"min size",
"max size",
"open for business"
];

// ─── Weighted Scoring Email-Level Classifier ──────────────────────────────────
// Scores entire email body with weighted keyword combinations for high accuracy

interface TypeScores { tonnage: number; vc: number; tc: number; }

function computeTypeScores(text: string): TypeScores {
  const upper = text.toUpperCase();
  let tonnage = 0, vc = 0, tc = 0;

  // ── TONNAGE INDICATORS (from prompt) ──────────────────────────────────────
  const tonnageKws: Array<[RegExp, number]> = [
    [/\bOPEN\s*(?:POSITION|PORT|LOCATION)?\b/i, 3],
    [/\bOPENINGS?\b/i, 2],
    [/\bSPOT\b/i, 2],
    [/\bPROMPT\b/i, 2],
    [/\bBALLAST\b/i, 2],
    [/\bETA\b/i, 1],
    [/\bSAILED\b/i, 2],
    [/\bLAST\s*CARGO\b/i, 3],
    [/\bTRY\s*ANY\b/i, 4],
    [/\bDIRECT\s*(?:POSITION|TONNAGE)\b/i, 4],
    [/\bOUR\s*(?:DIRECT|OWNERS?|POSITION)\b/i, 3],
    [/\bM\/?V\b/i, 3],
    [/\bVESSEL\b/i, 1],
    [/\bTONNAGE\b/i, 3],
    [/\bOPEN\s*HATCH\b/i, 3],
    [/\bBOX\s*SHAPED\b/i, 3],
    [/\bSELF\s*TRIMMING\b/i, 2],
    [/\bGEARED\b/i, 2],
    [/\bGEARLESS\b/i, 2],
    [/\bHOLDS?\b/i, 1],
    [/\bHATCHES?\b/i, 1],
    [/\bCRANES?\b/i, 1],
    [/\bGRABS?\b/i, 1],
    [/\bDWT\b/i, 3],
    [/\bDWCC\b/i, 3],
    [/\bGRT\b/i, 2],
    [/\bNRT\b/i, 2],
    [/\bLOA\b/i, 2],
    [/\bBEAM\b/i, 1],
    [/\bDEPTH\b/i, 1],
    [/\bTPC\b/i, 2],
    [/\bIMO\b/i, 2],
    [/\bFLAG\b/i, 2],
    [/\bBUILT\b|\bBLT\b/i, 2],
    [/\bCLASS\b/i, 1],
    [/\bGRAIN\s*CAP/i, 3],
    [/\bBALE\s*CAP/i, 3],
    [/\bBUNKERS?\s*(?:ROB|ON)/i, 2],
    [/\bROB\b/i, 1],
    [/\bCONSUMPTION\b/i, 1],
    [/\bSPEED\b/i, 1],
    [/\bPORT\s*OF\s*REGISTRY\b/i, 2],
    [/\bO\/A\b/i, 3],
    [/\bOPEN\s+[A-Z]+\s+O\/A\b/i, 5],
    [/\bDIRECT\s*OWS?\b/i, 4],
    [/\bBULK\s*CARRIER\b/i, 3],
    [/\bSUPRAMAX\b|\bULTRAMAX\b|\bPANAMAX\b|\bKAMSARMAX\b|\bCAMSARMAX\b|\bHANDYMAX\b|\bHANDYSIZE\b|\bCAPESIZE\b/i, 3],
  ];

  // ── VC INDICATORS (from prompt) ────────────────────────────────────────────
  const vcKws: Array<[RegExp, number]> = [
    [/\bACCT\b|\bACCOUNT\b/i, 2],
    [/\bSTEM\b/i, 3],
    [/\bCARGO\b/i, 1],
    [/\bLOAD\s*PORT\b|\bLOADING\s*PORT\b/i, 4],
    [/\bDISCHARGE\s*PORT\b|\bDISPORT\b/i, 4],
    [/\bDISCHARGE\s*RATE\b|\bDISRATE\b/i, 3],
    [/\bLOAD\s*RATE\b|\bLDRATE\b/i, 3],
    [/\bFREIGHT\b/i, 3],
    [/\bUSD\/MT\b|\bPMT\b|\bPER\s*MT\b/i, 4],
    [/\bLUMPSUM\b|\bLS\b/i, 3],
    [/\bLAYCAN\b/i, 3],
    [/\bSHINC\b|\bSHEX\b/i, 3],
    [/\bCQD\b/i, 3],
    [/\bFIO\b|\bFIOS\b|\bFILO\b/i, 3],
    [/\bMOLCO\b|\bMOLOO\b/i, 3],
    [/\bCHOPT\b/i, 2],
    [/\bDEMURRAGE\b/i, 3],
    [/\bDESPATCH\b/i, 3],
    [/\bNOR\b/i, 2],
    [/\bWIBON\b/i, 2],
    [/\bIN\s*BULK\b/i, 2],
    [/\bPOL\b|\bPOD\b/i, 3],
    [/\b\d{1,3}[,.]\d{3}\s*MT\b/i, 2],
    [/\bVOYAGE\s*CHARTER\b/i, 5],
  ];

  // ── TC INDICATORS (from prompt) ────────────────────────────────────────────
  const tcKws: Array<[RegExp, number]> = [
    [/\bTIME\s*CHARTER\b/i, 5],
    [/\bTRIP\s*TIME\s*CHARTER\b/i, 5],
    [/\bTCT\b/i, 4],
    [/\b\d+\s*TCT\b/i, 5],
    [/\bPERIOD\b/i, 2],
    [/\bDEL(?:IVERY)?\s*[:\-]/i, 3],
    [/\bREDEL(?:IVERY)?\s*[:\-]/i, 4],
    [/\bDELY\s*[:\-]/i, 3],
    [/\bREDELY\s*[:\-]/i, 4],
    [/\bON\s*HIRE\b/i, 4],
    [/\bOFF\s*HIRE\b/i, 3],
    [/\bDURATION\b/i, 3],
    [/\bMONTHS?\b/i, 1],
    [/\bNYPE\b|\bBALTIME\b|\bGENTIME\b/i, 5],
    [/\bHIRE\b/i, 3],
    [/\bUSD\/DAY\b|\bPER\s*DAY\b|\bPDPR\b/i, 4],
    [/\bBUNKERS?\s*ON\s*DEL(?:IVERY)?\b/i, 4],
    [/\bBUNKERS?\s*ON\s*REDEL(?:IVERY)?\b/i, 4],
    [/\bILOHC\b/i, 4],
    [/\bWORLDWIDE\s*TRADING\b|\bTRADING\s*LIMITS?\b/i, 4],
    [/\bVESSEL\s*(?:WANTED|REQUIREMENT|SIZE|TYPE)\b/i, 3],
  ];

  for (const [re, weight] of tonnageKws) if (re.test(upper)) tonnage += weight;
  for (const [re, weight] of vcKws) if (re.test(upper)) vc += weight;
  for (const [re, weight] of tcKws) if (re.test(upper)) tc += weight;

  // Priority rule: if TC signals include DEL+REDEL+HIRE/PERIOD, heavily boost TC
  // Match both "DEL:" (colon/dash) and "DEL PORT" (space-separated — common in broker shorthand)
  const hasDel = /\bDELY?\s*[:\-]/i.test(upper) || /\bDEL(?:IVERY)?\s*[:\-]/i.test(upper)
    || /\bDELY?\s+[A-Z]/i.test(upper) || /\bDEL(?:IVERY)?\s+[A-Z]/i.test(upper);
  const hasRedel = /\bREDELY?\s*[:\-]/i.test(upper) || /\bREDEL(?:IVERY)?\s*[:\-]/i.test(upper)
    || /\bREDELY?\s+[A-Z]/i.test(upper) || /\bREDEL(?:IVERY)?\s+[A-Z]/i.test(upper)
    || /\bRE-?DEL(?:IVERY)?\s+[A-Z]/i.test(upper);
  const hasHireOrPeriod = /\bHIRE\b|\bPERIOD\b|\bDURATION\b/i.test(upper);
  if (hasDel && hasRedel && hasHireOrPeriod) tc += 10;

  // Priority rule: DEL+REDEL even without hire → likely TC (not VC)
  if (hasDel && hasRedel) tc += 5;

  // If both voyage ports AND DEL/REDEL present, check for hire/duration → TC
  const hasVoyagePorts = /\bLOAD\s*PORT\b|\bDISCHARGE\s*PORT\b|\bPOL\b|\bPOD\b/i.test(upper);
  if (hasVoyagePorts && hasDel && hasRedel) {
    // Don't let VC dominate when TC signals are strong
    vc = Math.max(0, vc - 5);
  }

  // Priority rule: vessel spec heavy = tonnage
  const hasManyTechFields = [/\bDWT\b/, /\bLOA\b/, /\bGRT\b/, /\bNRT\b/, /\bBEAM\b/, /\bIMO\b/, /\bFLAG\b/, /\bBUILT\b/]
    .filter(r => r.test(upper)).length;
  if (hasManyTechFields >= 4) tonnage += hasManyTechFields * 2;

  return { tonnage, vc, tc };
}

function classifyEmailType(text: string): EntryType {
  const scores = computeTypeScores(text);
  const max = Math.max(scores.tonnage, scores.vc, scores.tc);
  // Always return the highest-scoring type; TC wins ties over VC, VC wins over Tonnage
  if (scores.tc >= scores.vc && scores.tc >= scores.tonnage && scores.tc > 0) return "TC";
  if (scores.vc >= scores.tonnage && scores.vc > 0) return "VC";
  if (scores.tonnage > 0) return "Tonnage";
  // Hard fallback: scan for the strongest single signal
  const u = text.toUpperCase();
  if (/\bTIME\s*CHARTER\b|\bTCT\b|\bDELY?\s*[:\-]|\bREDELY?\s*[:\-]|\bHIRE\b/i.test(u)) return "TC";
  if (/\bLAYCAN\b|\bLOAD\s*PORT\b|\bDISCHARGE\s*PORT\b|\bCARGO\b.*\bMT\b/i.test(u)) return "VC";
  return "Tonnage";
}

function normalizeForClassifier(
    text:string
):string {

 return text
  .toLowerCase()

  .replace(/\bt\/c\b/g,"time_charter")
  .replace(/\btc\b/g,"time_charter")
  .replace(/\btct\b/g,"trip_time_charter")

  .replace(/usd\/day/g,"rate_per_day")
  .replace(/per day/g,"rate_per_day")

  .replace(/usd\/mt/g,"rate_per_mt")
  .replace(/\bpmt\b/g,"rate_per_mt")

  .replace(/\bvoyage\s*charter\b/g,"voyage_charter")
.replace(/\bv\/c\b/g,"voyage_charter")

.replace(/\bpdpr\b/g,"rate_per_day")

.replace(/\blump\s*sum\b/g,"lumpsum")
.replace(/\bls\b/g,"lumpsum")

.replace(/\bdely\b/g,"delivery")
.replace(/\bredely\b/g,"redelivery")
.replace(/\bredel\b/g,"redelivery")

.replace(/\bdisport\b/g,"discharge_port")
.replace(/\bdisch\b/g,"discharge")

.replace(/\bcgo\b/g,"cargo")
.replace(/\bfrt\b/g,"freight")

.replace(/\bm\/v\b/g,"vessel")
.replace(/\bmv\b/g,"vessel")

.replace(/\bqty\b/g,"quantity");
}

const TONNEX_VESSEL_OPEN_REGEX = /\b(?:M\/V|MV|VESSEL)\b/i;
const TONNEX_OPEN_TERM_REGEX = /\b(?:OPEN(?:\s+AT|\s+PORT|\s+ING)?|WILL\s+OPEN|OPENING|SAILED|ETA|O\/A)\b/i;
const TONNEX_VC_QUANTITY_REGEX = /\b\d{1,3}(?:[,\.\s]\d{3})*\s*(?:MT|MTS|METRIC\s*TONS?)\b/i;
const TONNEX_VC_KT_MT_REGEX = /\b\d+(?:\.\d+)?K\s*(?:MT|MTS)\b/i;
const TONNEX_TC_INDICATOR_REGEX = /\b(?:DELY?|DELIVERY|REDELY?|REDEL|REDELIVERY|TIME\s*CHARTER|TCT\b|HIRE|DURATION|PERIOD|NYPE|BALTIME|SHELLTIME|GENTIME|BOXTIME|LINERTIME|Vessel\s*Wanted)\b/i;
// TC requirement labels and detector (single definition kept below)
const TC_REQUIREMENT_LABELS = [
  "ACCOUNT",
  "VESSEL TYPE",
  "CARGO",
  "TONNAGE",
  "LAYCAN",
  "DELIVERY",
  "REDELIVERY",
  "DURATION",
];

function hasTCRequirementLabels(text: string): boolean {
  const upper = text.toUpperCase();
  const count = TC_REQUIREMENT_LABELS.filter(label => new RegExp(`\\b${label}\\b\\s*[:\\-]`, "i").test(upper)).length;
  return count >= 5 && /\bACCOUNT\b/i.test(upper) && /\bVESSEL\s*TYPE\b/i.test(upper) && /\bCARGO\b/i.test(upper) && /\bTONNAGE\b/i.test(upper);
}

function isVesselOpeningSegment(segment: string): boolean {
  return TONNEX_VESSEL_OPEN_REGEX.test(segment) && TONNEX_OPEN_TERM_REGEX.test(segment);
}

function hasVCSignalsFromMovement(segment: string): boolean {
  const upper = segment.toUpperCase();
  const compact = compactForFallback(segment).toUpperCase();

  const BULK_COMMODITY_PATTERN = /\b(?:UREA|FERTS?|FERTILIZ|FERTILISERS?|COAL|CLINKER|SLAG|MAIZE|CORN|WHEAT|BARLEY|RICE|PETCOKE|LIMESTONE|BAUXITE|SOYA|SOYBEAN|GRAIN|GRAINS|SUGAR|SULPHUR|POTASH|PHOSPHATE|GYPSUM|DAP|MOP|NPK|SALT|CHROME|CHROMITE|ORE|IRON\s*ORE|MANGANESE|NICKEL|COPPER|ZINC|BAGGED|CLINKERS?|WOODCHIPS?|LOGS?|TIMBER|SCRAP|CEMENT|FERTILISERS?|FERTILIZERS?|PIG\s*IRON|BILLETS?|SLABS?|COILS?|PLATES?|BARS?|RODS?|PELLETS?|BENTONITE|QUARTZ|TALC|ILMENITE|RUTILE|ZIRCON|MINERAL|SODA|ASH|CRUDE|VEGETABLE\s*OIL|PALM\s*OIL|PETROLEUM\s*COKE|STEAM\s*COAL|COKING\s*COAL|ANTHRACITE|LIGNITE|PEAT|DOLOMITE|KAOLIN|CLAY|AGRI|AGRICULTURAL)\b/i;

  const hasOldVCSignals = /\b(?:LOAD\s*PORT|LP|POL|DISCHARGE\s*PORT|DP|POD|LOAD\s*RATE|DISCHARGE\s*RATE|DISRATE|LDRATE|LAYCAN)\b/i.test(upper);

  const vcRegex = /(?:LP|LOADING\s*PORT?|POL|POD|DISCHARGE\s*PORT)\s*[:\s]+|VOYAGE\s*CHARTER|LOAD\s*RATE|DISRATE|DISCHARGING\s*RATE|\b\d{4,6}\s*MT\b|\bMTS\b|\bIN\s+BULK\b|\b\d+(?:\.\d+)?K\b|\b\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?K\b|\bSF\s*\d/i;

  const hasVCSignals = vcRegex.test(upper)
    || /\b\d{1,3}[,]\d{3}\s*MT\b/.test(upper)
    || /\b\d+\s*(?:SP|P)?\s+[A-Z][A-Z0-9 .'-]+?\s*\/\s*\d+\s*(?:SP|P)?\s+[A-Z][A-Z0-9 .'-]+/.test(compact)
    || (BULK_COMMODITY_PATTERN.test(upper) && (
      /\b\d{4,6}\s*(?:MT|MTS|MTONS)\b/i.test(upper)
      || /\b\d{1,3}[,.-]\d{3}\s*(?:MT|MTS)\b/i.test(upper)
      || /\b\d+(?:\.\d+)?K\b/i.test(upper)
      || /\b\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?K\b/i.test(upper)
    ));

  return Boolean(hasVCSignals || hasOldVCSignals);
}

function detectSegmentType(segment: string): EntryType | null {
  if (isTechnicalProfileSegment(segment)) return null;
  const upper = segment.toUpperCase();
  const compact = compactForFallback(segment).toUpperCase();
  const normalized = normalizeForClassifier(segment);

  // Filter obvious boilerplate / header blocks that announce lists but contain no vessel data
  if (/\b(DEAR\s+SIRS|GOOD\s+DAY|OUR\s+DIRECT\s+OWS\s+OPEN|PLS\s+PPSE\s+SUIT|PLEASE\s+ADVISE|PLEASE\s+PROPOSE)\b/i.test(segment)) {
    // Allow if TC signals (TCT, REDEL, ACCT) or vessel data are present
    if (!/\bM\/?V\b|\bDWT\b|\bLOA\b|\bBUILT\b|\bBLT\b|\bTCT\b|\bREDEL\b|\b(?:ACCT|A\/C)\s+\w/i.test(segment)) return null;
  }

  const headerLines = segment.split(/\r?\n/);
  const subjectIndex = headerLines.findIndex(line => /^\s*Subject:/i.test(line));
  if (subjectIndex >= 0 && headerLines.slice(0, subjectIndex + 1).some(line => /^\s*(?:From|To|Date|Cc|Bcc):/i.test(line))) {
    const afterSubject = headerLines.slice(subjectIndex + 1).join("\n");
    const hasVesselMarkers = /\b(?:M\/?V|MV|VESSEL|DWT|IMO|LOA|BEAM|BLT|BUILT|FLAG|GRT|NRT|BALLAST|GRAIN|DWT\/DRAFT|\d{1,3}K)\b/i.test(afterSubject);
    const hasCargoMarkers = /\b(?:CARGO|COMMODITY|LOAD\s*PORT|DISCHARGE\s*PORT|LAYCAN|QUANTITY|QTY|POL|POD|CHARTERER|ACCT|A\/C|DELY|REDELY|TIME\s*CHARTER|HIRE)\b/i.test(afterSubject);
    if (!hasVesselMarkers && !hasCargoMarkers) return null;
  }

  // Force "Tonnage" if subject line has DIRECT TONNAGE or POSITION OF VESSELS signals
  const hasDirectTonnageSubject = /\bDIRECT\s+(?:TONNAGE|POSITION)\b|\bOWNERS?\s+(?:DIRECT|OPEN|POSITION)\b|\bTONNAGE\s+POSITION\b/i.test(segment);
  if (hasDirectTonnageSubject && /\b(?:DWT|LOA|IMO|BUILT|BLT|FLAG|GRT)\b/i.test(segment)) return "Tonnage";

  const hasMvHeading = /\bM\s*\/?V\.?\b/i.test(segment) || /\bMV\.?\s+[A-Z]/i.test(segment) || /\bVESSEL\b/i.test(segment);
  const hasVesselOpening = isVesselOpeningSegment(segment);
  const hasTCRequirements = hasTCRequirementLabels(segment);
  const hasTCSignals = TONNEX_TC_INDICATOR_REGEX.test(upper);
  const hasOldVCSignals = hasVCSignalsFromMovement(segment) || /\b(?:LOAD\s*PORT|LP|POL|DISCHARGE\s*PORT|DP|POD|LOAD\s*RATE|DISCHARGE\s*RATE|DISRATE|LDRATE|LAYCAN)\b/i.test(upper);
  const hasVCCandidate = /\b(?:CARGO|COMMODITY|QUANTITY|QTY|LOAD\s*PORT|DISCHARGE\s*PORT|POL|POD|MT|MTS)\b/i.test(upper);
  const hasVesselSizeK = /\b\d{1,3}K\b/i.test(upper);
  const hasTonnageHeadlineOffer = hasMvHeading && hasVesselSizeK && /\b(?:SPOT|PROMPT|TRY\s+ANY|AVAILABLE|OPEN(?:\s+AT|\s+FOR)?|OPEN\s+PORT|OPEN\s+FOR)\b/i.test(upper);

  const BULK_COMMODITY_PATTERN = /\b(?:UREA|FERTS?|FERTILIZ|FERTILISERS?|COAL|CLINKER|SLAG|MAIZE|CORN|WHEAT|BARLEY|RICE|PETCOKE|LIMESTONE|BAUXITE|SOYA|SOYBEAN|GRAIN|GRAINS|SUGAR|SULPHUR|POTASH|PHOSPHATE|GYPSUM|DAP|MOP|NPK|SALT|CHROME|CHROMITE|ORE|IRON\s*ORE|MANGANESE|NICKEL|COPPER|ZINC|BAGGED|CLINKERS?|WOODCHIPS?|LOGS?|TIMBER|SCRAP|CEMENT|PIG\s*IRON|BILLETS?|SLABS?|COILS?|PLATES?|BARS?|RODS?|PELLETS?|BENTONITE|QUARTZ|DOLOMITE|KAOLIN|CLAY|AGRI|AGRICULTURAL|CRUDE|VEGETABLE\s*OIL|PALM\s*OIL|STEAM\s*COAL|COKING\s*COAL|ANTHRACITE|PETROLEUM\s*COKE)\b/i;

  const hasVCSignals =
    /(?:LP|LOADING\s*PORT?|POL|POD|DISCHARGE\s*PORT)\s*[:\s]+|VOYAGE\s*CHARTER|LOAD\s*RATE|DISRATE|DISCHARGING\s*RATE|\b\d{4,6}\s*MT\b|\bMTS\b|\bIN\s+BULK\b|\b\d+(?:\.\d+)?K\b|\b\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?K\b|\bSF\s*\d/i.test(upper)
    || /\b\d{1,3}[,]\d{3}\s*MT\b/.test(upper)
    || /\b\d+\s*(?:SP|P)?\s+[A-Z][A-Z0-9 .'-]+?\s*\/\s*\d+\s*(?:SP|P)?\s+[A-Z][A-Z0-9 .'-]+/.test(compact)
    || (
      BULK_COMMODITY_PATTERN.test(upper) && (
        /\b\d{4,6}\s*(?:MT|MTS|MTONS)\b/i.test(upper)
        || /\b\d{1,3}[,.-]\d{3}\s*(?:MT|MTS)\b/i.test(upper)
        || /\b\d+(?:\.\d+)?K\b/i.test(upper)
        || /\b\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?K\b/i.test(upper)
      )
    );

  const hasVCSignalsFinal = hasVCSignals || hasOldVCSignals;

  const tonnagePattern = /\b(?:OPEN|O\/A|OPEN\s+AT|OPEN\s+PORT|OPENING|WILL\s*OPEN|DWT|IMO|BUILT|BLT|BULK\s*CARRIER|FLAG|GRT|NRT|BALLAST|GEARED|GEARLESS|GRABS|CRANES|DERRICKS|DWT\/DRAFT|\d{1,3}K)\b/i;
  const hasTonnageRegex = (hasMvHeading && tonnagePattern.test(upper)) || /\bM[TV]\/??[\s\w]+(?:OPEN|WILL OPEN|'[0-9]{2}|IMO|DWT\/DRAFT|BULK CARRIER|FLAG[:\s]|BUILT:)/i.test(segment) || (/OPEN\s+[A-Z]+/.test(upper) && !hasTCSignals && !hasVCSignalsFinal);

  // Priority: vessel-opening and explicit tonnage signals must short-circuit ALL other logic
  if (hasTCRequirements) return "TC";
  if (hasVesselOpening) return "Tonnage";
  if (hasTonnageHeadlineOffer) return "Tonnage";
  if (hasTonnageRegex) return "Tonnage";

  // Only after tonnage signals checked, then charter signals
  if (hasTCSignals) return "TC";

  // Only after tonnage and charter, then VC signals
  if (hasVCSignalsFinal && hasVCCandidate) return "VC";

  // Fallback heuristics
  if (/CARGO\s*[:\s]/i.test(segment) && /QUANTITY\s*[:\s]/i.test(segment)) return "VC";
  if (/CARGO\s*[:\s]/i.test(segment) && /DELY?\s*[:\s*]+/i.test(segment)) return "TC";
  const hasCargoReference = BULK_COMMODITY_PATTERN.test(upper) || /\bCARGO\b/i;
  if (hasCargoReference && (parseQuantity(segment).min || /\b\d+(?:\.\d+)?K\b/i.test(upper) || /\b\d+(?:\.\d+)?\s*-\s*\d+(?:\.\d+)?K\b/i.test(upper))) {
    return "VC";
  }

  return null;
}

// Export helper functions for debugging and regression testing.
export { segmentEmail, isTechnicalProfileSegment, detectSegmentType };

// ─── Entry Extractors ─────────────────────────────────────────────────────────

function extractVCEntry(segment: string, signature: ReturnType<typeof extractSignature>): ExtractedEntry {
  const lpMatch = segment.match(PATTERNS.loadPort);
  const dpMatch = segment.match(PATTERNS.dischargePort);
  const laycanMatch = segment.match(/LAYCAN[:\s:*]+([^\n]+)/i) || segment.match(/\bLC\s+([^\n]+)/i);

  // Parse explicit LAYCAN START / LAYCAN END labels (common in broker emails)
  const laycanStartLabel = segment.match(/LAYCAN\s+START\s*[:\-\s]+([^\n]+)/i);
  const laycanEndLabel = segment.match(/LAYCAN\s+END\s*[:\-\s]+([^\n]+)/i);
  let vcExplicitStart: string | null = null;
  let vcExplicitEnd: string | null = null;
  if (laycanStartLabel) {
    const p = parseLaycan(laycanStartLabel[1].trim());
    vcExplicitStart = p.start ?? null;
  }
  if (laycanEndLabel) {
    const p = parseLaycan(laycanEndLabel[1].trim());
    vcExplicitEnd = p.start ?? null;
  }

  const qty = parseQuantity(segment);
  const laycanText = laycanMatch ? laycanMatch[1] : segment;
  const { start: rawStart, end: rawEnd } = parseLaycan(laycanText);
  // Prefer explicit START/END labels; fall back to combined LAYCAN parse
  const start = vcExplicitStart ?? rawStart;
  const end = vcExplicitEnd ?? rawEnd;

  const cargo = extractCargoName(segment);

  // Account/Charterer name extraction for VC
  function extractVCAccountName(seg: string): string | null {
    const m = seg.match(PATTERNS.account);
    if (m && m[1]) return m[1].trim().replace(/[():]+$/g, "").replace(/\s*\([^)]*\)\s*$/i, "").replace(/\s*\([^)]*$/, "").trim();
    const m2 = seg.match(/(?:^|\n)\s*(?:ACCT|A\/C|ACCOUNT(?:\s+NAME)?|CHARTERER)[:\s\-]*\(?([^\n)]+)\)?/i);
    if (m2 && m2[1]) return m2[1].trim().replace(/[():]+$/g, "").replace(/\s*\([^)]*\)\s*$/i, "").replace(/\s*\([^)]*$/, "").trim();
    const m3 = seg.match(/\b(?:ACCT|A\/C)\s+([A-Z0-9\- '\(\)\/]{3,80})/i);
    if (m3 && m3[1]) {
      return m3[1]
        .trim()
        .replace(/\s*\([^)]*\)\s*$/i, "")  // strip complete parenthetical
        .replace(/\s*\([^)]*$/, "")          // strip incomplete trailing parenthetical
        .trim();
    }
    return null;
  }
  const vcAccountName = extractVCAccountName(segment);

  const route = extractRoutePorts(segment);
  const rawLoadPort = lpMatch ? lpMatch[1].trim().split("\n")[0] : route.load;
  const rawDischPort = dpMatch ? dpMatch[1].trim().split("\n")[0] : route.discharge;
  // resolveMultiPort handles "OR", "&", SPSB notation, and single ports
  const loadPort = resolveMultiPort(rawLoadPort);
  const dischPort = resolveMultiPort(rawDischPort);

  const restrictions: string[] = [];
  const restrMatches = segment.match(PATTERNS.restriction);
  if (restrMatches) {
    restrictions.push(
      ...restrMatches
        .map(r => r.trim().replace(/\s*[()]+\s*$/, "").replace(/\s+/g, " ").trim())
        .filter(r => r.length > 4)
        .slice(0, 5)
    );
  }

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

  // Try to infer region from ports if not explicitly stated
  const vcRegion = (loadPort ? resolveRegion(loadPort) : null)
    || (dischPort ? resolveRegion(dischPort) : null)
    || resolveRegion(segment)
    || null;

  const fields: ExtractedFields = {
    email_type: "VC",
    cargo_name: cargo,
    cargo_type: cargo ? detectCargoType(segment) : null,
    account_name: vcAccountName,
    min_size: qty.min,
    max_size: qty.max,
    load_port: loadPort,
    discharge_port: dischPort,
    laycan_start_date: start,
    laycan_end_date: end ?? (start ? new Date(new Date(start).getTime() + 5 * 86400000).toISOString().split("T")[0] : null),
    region: vcRegion,
    matching_region: vcRegion,
    pic: signature.pic,
    email_id: signature.email,
    phone_number: signature.phone,
    restriction: restrictions.length > 0 ? restrictions.join("; ") : null,
    ...technical,
  };

  // VC fallbacks: extract PIC / Email / Phone from the segment if signature missing
  if (!fields.pic) {
    const pm = segment.match(/\bPIC\b(?:[ \t]*[:\-][ \t]*|[ \t]+)([^\n\r]+)/i)
      || segment.match(/\bCONTACT\s*PERSON\b[:\-\s]*([^\n\r]+)/i)
      || segment.match(/\bATTN\b[:\-\s]*([^\n\r]+)/i);
    if (pm) {
      const candidate = pm[1].trim().split(/[,\|]/)[0].trim();
      if (candidate && !isGenericContactPhrase(candidate) && candidate.length <= 60) {
        fields.pic = candidate;
      }
    }
  }
  if (!fields.email_id) {
    const em = segment.match(/\bE-?MAIL\b[:\-\s]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i)
      || segment.match(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/);
    if (em) fields.email_id = em[1].trim();
  }
  if (!fields.phone_number) {
    const ph = segment.match(/(?:Mobile|Phone|WhatsApp|Contact|Tel|Mob|Cell)\s*[:\/]?\s*([+\d][\d\s\-().]{6,24})/i)
      || segment.match(/(\+\d{1,3}[\s\-]?\d{3,}[\d\s\-]{6,})/);
    if (ph && isValidPhone(ph[1].trim())) fields.phone_number = ph[1].trim();
  }

  return { entryType: "VC", confidence: Math.min(0.98, conf), extractionMethod: "rule-based", fields };
}

function extractTCEntry(segment: string, signature: ReturnType<typeof extractSignature>): ExtractedEntry {
  // Robust account extraction: prefer explicit "Account"/"A/C"/"ACCT" labels, including parenthetical forms
  function extractAccountName(seg: string): string | null {
    const m = seg.match(PATTERNS.account);
    if (m && m[1]) {
      const raw = m[1].trim().replace(/[():]+$/g, "");
      // Clean up inline remarks like "( OUR USUAL ONE )" or "(OUR USUAL)"
      return raw
        .replace(/\s*\([^)]*\)\s*$/i, "")   // strip complete parenthetical
        .replace(/\s*\([^)]*$/, "")           // strip incomplete trailing parenthetical
        .trim();
    }
    const m2 = seg.match(/(?:^|\n)\s*(?:ACCT|A\/C|ACCOUNT(?:\s+NAME)?|CHARTERER)[:\s\-]*\(?([^\n)]+)\)?/i);
    if (m2 && m2[1]) {
      const raw = m2[1].trim().replace(/[():]+$/g, "");
      return raw.replace(/\s*\([^)]*\)\s*$/i, "").replace(/\s*\([^)]*$/, "").trim();
    }
    // Plain inline: "ACCT SEAWIND ( OUR USUAL ONE )"
    const m3 = seg.match(/\b(?:ACCT|A\/C)\s+([A-Z0-9\- '\(\)\/]{3,80})/i);
    if (m3 && m3[1]) {
      return m3[1]
        .trim()
        .replace(/\s*\([^)]*\)\s*$/i, "")  // strip complete parenthetical
        .replace(/\s*\([^)]*$/, "")          // strip incomplete trailing parenthetical
        .trim();
    }
    return null;
  }
  const cargoMatch =
    segment.match(/(?:CARGO|COMMODITY)\s*:\s*([^\n*]+)/i) ||
    segment.match(/\b\d\s+TCT\s+(?:WITH\s+)?([A-Z][A-Z'\s\/OR]+?)\s+IN\s+BLK/i) ||
    segment.match(/\bTCT\s+(?:WITH\s+)?([A-Z][A-Z'\s\/OR]+?)\s+IN\s+BLK/i);

  const dwtInfo = parseDwt(segment);
  const laycanMatch =
    segment.match(/LAYCAN[:\s:*]+([^\n]+)/i) ||
    segment.match(/\bL[\/]?CAN\s+([^\n]+)/i) ||
    segment.match(/\bLC\s+([^\n]+)/i);

  // Parse explicit LAYCAN START / LAYCAN END labels (common in broker emails)
  const tcLaycanStartLabel = segment.match(/LAYCAN\s+START\s*[:\-\s]+([^\n]+)/i);
  const tcLaycanEndLabel = segment.match(/LAYCAN\s+END\s*[:\-\s]+([^\n]+)/i);
  let tcExplicitStart: string | null = null;
  let tcExplicitEnd: string | null = null;
  if (tcLaycanStartLabel) {
    const p = parseLaycan(tcLaycanStartLabel[1].trim());
    tcExplicitStart = p.start ?? null;
  }
  if (tcLaycanEndLabel) {
    const p = parseLaycan(tcLaycanEndLabel[1].trim());
    tcExplicitEnd = p.start ?? null;
  }

  const delMatch = segment.match(PATTERNS.delivery);
  const redelMatch = segment.match(PATTERNS.redelivery);
  // Duration: explicit label, "PERIOD:", "ABT N DAYS WOG", "N+N MONTHS", "UPTO N/N MOS"
  const durationMatch =
    segment.match(/DURATION[:\s*]+(?:ABT\s+)?([^\n*]+)/i) ||
    segment.match(/PERIOD[:\s*]+(?:ABT\s+)?([^\n*]+)/i) ||
    segment.match(/\bABT\s+(\d+(?:\s*[+\-]\s*\d+)?)\s*(?:DAYS?|DYS?|MONTHS?|MOS?)\s*(?:WOG|WS|EACH|MIN|MAX)?\b/i) ||
    segment.match(/\bUPTO\s+(\d+\s*\/\s*\d+)\s*(?:MONTHS?|MOS?)/i) ||
    segment.match(/\b(\d+(?:\s*[+]\s*\d+)?)\s+(?:MONTHS?|MOS?)\s*(?:TCT|CHARTER|EACH|MIN|OPTION)?\b/i);
  const laycanText = laycanMatch ? laycanMatch[1] : segment;
  const { start: tcRawStart, end: tcRawEnd } = parseLaycan(laycanText);
  // Prefer explicit START/END labels over combined LAYCAN parse
  const start = tcExplicitStart ?? tcRawStart;
  const end = tcExplicitEnd ?? tcRawEnd;
  const duration = durationMatch ? parseDuration(durationMatch[0]) : null;

  const rawCargo = cargoMatch ? cargoMatch[1].trim().split("\n")[0].trim() : null;
  let cargo = extractCargoName(segment) ?? (rawCargo && isValidCargo(rawCargo) ? normalizeCargo(rawCargo) : null);
  // Comprehensive TCT WITH / 1TCT fallback for broker shorthand
  if (!cargo) {
    const tctPatterns = [
      // "1 TCT WITH COAL" / "1TCT WITH H'LESS BAGGED RICE"
      /\b(?:\d+\s*)?TCT\s+WITH\s+(?:H'?LESS\s+)?(?:BAGGED\s+)?([A-Z][A-Z'\s\/]{2,35})(?=\s+(?:TO|FROM|IN\s+BLK|CARGO|\n)|$)/im,
      // "1 TCT GRAIN OR SUGAR IN BLK"
      /\b\d\s*TCT\s+([A-Z][A-Z'\s\/OR]{3,30})\s+IN\s+BLK/im,
      // "FOR 1TCT VIA INDO TO SE ASIA WITH COAL"
      /FOR\s+\d*\s*TCT\s+(?:VIA\s+\w+\s+(?:TO\s+\w+\s+)?)?WITH\s+([A-Z][A-Z'\s\/]{2,30})(?=\s|\n|$)/im,
      // "ONE TCT WITH HLESS CARGO (INT STEEL BILLETS)"
      /(?:ONE|1)\s+TCT\s+(?:WITH\s+)?(?:H'?LESS(?:S)?\s+)?(?:BAGGED\s+)?([A-Z][A-Z'\s]{2,30})(?:\s+CARGO|\s+IN\s+)/im,
      // "1TCT DELY..." with cargo in subject/topic
      /\b\d\s*TCT\s+([A-Z][A-Z'\s]{3,25})\s+(?:TO|FROM)\b/im,
    ];
    for (const pat of tctPatterns) {
      const m = segment.match(pat);
      if (m?.[1]) {
        const cand = m[1].replace(/H'?LESS/gi, "").replace(/\bBAGGED\b/gi, "").replace(/\bBLK\b/gi, "").trim();
        const c2 = cleanCargoName(cand);
        if (c2 && isValidCargo(c2)) { cargo = c2; break; }
      }
    }
  }

  const route = extractRoutePorts(segment);
  const rawDel = delMatch ? delMatch[1].trim().split("\n")[0] : route.load;
  const rawRedel = redelMatch ? redelMatch[1].trim().split("\n")[0] : route.discharge;
  // Strip "1SP", "2SP", "1P", "IP" (broker port notation) from beginning of port strings
  // e.g. "1SP USG INT HOUSTON-TAMPA RANGE" → "USG INT HOUSTON-TAMPA RANGE"
  function stripBrokerPortNotation(raw: string | null): string | null {
    if (!raw) return null;
    return raw.replace(/^\s*\d\s*(?:SP|P)\s+/i, "").replace(/^\s*I\s*(?:SP|P)\s+/i, "").trim();
  }
  const cleanedDel = stripBrokerPortNotation(rawDel);
  const cleanedRedel = stripBrokerPortNotation(rawRedel);
  const delPort = cleanedDel && isValidPort(cleanedDel) ? resolvePort(cleanedDel) : null;
  const redelPort = cleanedRedel && isValidPort(cleanedRedel) ? resolvePort(cleanedRedel) : null;

  const restrictions: string[] = [];
  const restrMatches = segment.match(PATTERNS.restriction);
  if (restrMatches) {
    restrictions.push(
      ...restrMatches
        .map(r => r.trim().replace(/\s*[()]+\s*$/, "").replace(/\s+/g, " ").trim())
        .filter(r => r.length > 4 && !/^\s*EXCL\s*$/.test(r))
        .slice(0, 5)
    );
  }

  const technical = extractCommonTechnicalFields(segment);

  const acctName = extractAccountName(segment);

  // Confidence scoring
  let conf = 0.40;
  if (acctName) conf += 0.08;
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
    account_name: acctName ? String(acctName.trim()) : null,
    cargo_name: cargo,
    cargo_type: cargo ? detectCargoType(segment) : null,
    min_size: dwtInfo.min,
    max_size: dwtInfo.max,
    del_port: delPort,
    redel_port: redelPort,
    laycan_start_date: start,
    laycan_end_date: end ?? (start ? new Date(new Date(start).getTime() + 5 * 86400000).toISOString().split("T")[0] : null),
    duration,
    region: (delPort ? resolveRegion(delPort) : null) || (redelPort ? resolveRegion(redelPort) : null) || resolveRegion(segment) || null,
    matching_region: (delPort ? resolveRegion(delPort) : null) || (redelPort ? resolveRegion(redelPort) : null) || resolveRegion(segment) || null,
    pic: signature.pic,
    email_id: signature.email,
    phone_number: signature.phone,
    restriction: restrictions.length > 0 ? restrictions.join("; ") : null,
    ...technical,
  };

  // TC fallbacks: extract PIC / Email / Phone from the segment if signature missing
  if (!fields.pic) {
    const pm = segment.match(/\bPIC\b(?:[ \t]*[:\-][ \t]*|[ \t]+)([^\n\r]+)/i)
      || segment.match(/\bCONTACT\s*PERSON\b[:\-\s]*([^\n\r]+)/i)
      || segment.match(/\bATTN\b[:\-\s]*([^\n\r]+)/i);
    if (pm) {
      const candidate = pm[1].trim().split(/[,\|]/)[0].trim();
      if (candidate && !isGenericContactPhrase(candidate) && candidate.length <= 60) {
        fields.pic = candidate;
      }
    }
  }
  if (!fields.email_id) {
    const em = segment.match(/\bE-?MAIL\b[:\-\s]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i)
      || segment.match(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/);
    if (em) fields.email_id = em[1].trim();
  }
  if (!fields.phone_number) {
    const ph = segment.match(/(?:Mobile|Phone|WhatsApp|Contact|Tel|Mob|Cell)\s*[:\/]?\s*([+\d][\d\s\-().]{6,24})/i)
      || segment.match(/(\+\d{1,3}[\s\-]?\d{3,}[\d\s\-]{6,})/);
    if (ph && isValidPhone(ph[1].trim())) fields.phone_number = ph[1].trim();
  }

  return { entryType: "TC", confidence: Math.min(0.98, conf), extractionMethod: "rule-based", fields };
}

function extractTonnageEntry(segment: string, signature: ReturnType<typeof extractSignature>): ExtractedEntry {

  // Strip leading email header lines (From:/Sent:/To:/Subject:/CC:) and company header
  // lines that appear when a forwarded email's first segment is processed. Without stripping,
  // the vessel name appears after several header lines and is outside the first-3-line window.
  const EMAIL_HEADER_LINE = /^(?:From|Sent|To|CC|BCC|Subject|Date|Reply-To)\s*:/i;
  const segLines = segment.split("\n");
  let firstVesselLine = 0;
  for (let hi = 0; hi < segLines.length; hi++) {
    const l = segLines[hi].trim();
    if (!l) continue; // skip blanks
    if (EMAIL_HEADER_LINE.test(l)) { firstVesselLine = hi + 1; continue; }
    break; // first non-header, non-blank line — vessel data starts here
  }
  // Only strip if the headers were at the very beginning (first ~10 lines)
  if (firstVesselLine > 0 && firstVesselLine <= 10) {
    segment = segLines.slice(firstVesselLine).join("\n");
  }

  const mvMatch =
    segment.match(PATTERNS.mvName) ||
    segment.match(/^(?:AA\)|BB\)|CC\)|DD\)|EE\)|FF\)|GG\)|HH\)|[A-Z]{1,3}\))\s*(?:M\.?V\.?\s+)?([A-Z][A-Z0-9\s.'-]+?)(?:\s+\(|\s*\/|\s+\d{2,3}K|\s+[\('"]|\n)/im) ||
    segment.match(/^(?:\d+\))\s*(?:M\.?V\.?\s+)?([A-Z][A-Z0-9\s.'-]+?)(?:\s+\(|\s*\/|\n)/im) ||
    segment.match(/\bNAME\s*:\s*(?:M\.?[TV]\.?\/?\s+)?([A-Z][A-Z0-9\s.'-]+?)(?:\s*\(|\n|,|\s+IMO)/i) ||
    segment.match(/\bVESSEL\s*:\s*(?:M\.?[TV]\.?\/?\s+)?([A-Z][A-Z0-9\s.'-]+?)(?:\s*,|\s+\d{2,4}|\n)/i);

  let vesselName: string | null = null;
  if (mvMatch && mvMatch[1]) {
    vesselName = normalizeVesselName(mvMatch[1]);
  }
  if (!vesselName) {
    const fallbackName = extractVesselNameFromTechnicalSegment(segment);
    if (fallbackName && isValidVesselName(fallbackName)) {
      vesselName = normalizeVesselName(fallbackName);
    }
  }

  // DWT extraction
  let dwtStr: string | null = null;
  const dwtExplicit =
    segment.match(/(?:DEADWEIGHT|DWT)\s*[/:–\s]+(?:SUMMER\s+)?(?:SALT\s+WATER[:\s]+)?([\d,\.]{5,12})/i) ||
    segment.match(/\bDEADWEIGHT\s+(\d{2,3}[,.]?\d{3})/i) ||
    segment.match(/(\d{2,3}[,.]?\d{3})\s*(?:MT|MTS)\s+@/i) ||
    segment.match(/\b(\d{2,3}[,.]?\d{3})\s*DWT\b/i) ||
    // "SUMMER DWT ,DRAFT : 50918.9 MT ON 11.5M" — common in detailed vessel specs
    segment.match(/SUMMER\s+DWT[,\s]+DRAFT\s*[:\-\s]+([\d,\.]+)\s*MT/i) ||
    // "12,248 dwat" — DWAT is synonym for DWT used by some carriers
    segment.match(/([\d,\.]{5,12})\s*dwat\b/i);

  if (dwtExplicit) {
    const raw = dwtExplicit[1].replace(/[,\s]/g, "");
    const num = Math.round(parseFloat(raw));
    // Guard: minimum 5000 DWT to prevent small numbers (hold counts etc) contaminating DWT
    if (!isNaN(num) && num >= 5000 && num <= 650000) dwtStr = num.toString();
  } else {
    const shortDwt = segment.match(/\b(\d{2,3}(?:\.\d)?)\s*[Kk]\s*(?:DWT|[-'"\s\/]|$)/m);
    if (shortDwt) {
      const val = Math.round(parseFloat(shortDwt[1]) * 1000);
      if (val >= 10000) dwtStr = val.toString();
    }
  }

  // NOTE: DWT is NEVER inferred from vessel class names. Only explicit numeric DWT values
  // are accepted. If no numeric DWT is found in the segment, dwtStr remains null.

  // Vessel type — extracted in priority order from explicit keywords in the segment
  function detectVesselTypeFromSegment(seg: string): string {
    const u = seg.toUpperCase();
    // Specific size classes first (most precise match)
    if (/\bBULK\s+CARRIER\b/.test(u)) return "Bulk Carrier";
    if (/\bBABY\s*CAPE\b/.test(u)) return "Baby Cape Bulk Carrier";
    if (/\bCAPESIZE\b|\bCAPE\s*SIZE\b/.test(u)) return "Capesize Bulk Carrier";
    if (/\bKAMSARMAX\b/.test(u)) return "Kamsarmax Bulk Carrier";
    if (/\bPOST[-\s]?PANAMAX\b/.test(u)) return "Post-Panamax Bulk Carrier";
    if (/\bULTRAMAX\b|\bUMAX\b/.test(u)) return "Ultramax Bulk Carrier";
    if (/\bSUPRAMAX\b|\bSMAX\b/.test(u)) return "Supramax Bulk Carrier";
    if (/\bPANAMAX\b|\bPMX\b/.test(u)) return "Panamax Bulk Carrier";
    if (/\bHANDYMAX\b/.test(u)) return "Handymax Bulk Carrier";
    if (/\bHANDYSIZE\b/.test(u)) return "Handysize Bulk Carrier";
    if (/\bVLCC\b/.test(u)) return "VLCC Tanker";
    if (/\bLR2\b/.test(u)) return "LR2 Tanker";
    if (/\bLR1\b/.test(u)) return "LR1 Tanker";
    if (/\bTANKER\b/.test(u)) return "Crude Oil Tanker";
    if (/\bGAS\s*CARRIER\b/.test(u)) return "Gas Carrier";
    if (/\bCONTAINER\b/.test(u)) return "Container Ship";
    // Fall back to DWT-based lookup only if an explicit numeric DWT was found
    if (dwtStr) {
      const dwtNum = parseInt(dwtStr, 10);
      if (!isNaN(dwtNum)) {
        for (const [key, val] of Object.entries(VESSEL_SIZE_MAP)) {
          if (dwtNum >= val.min && dwtNum <= val.max) return val.type;
        }
      }
    }
    return "Bulk Carrier";
  }
  const vesselType = detectVesselTypeFromSegment(segment);

  // Open port + date detection — also handles "OPEN: PORT\nDATE: date" split format
  const splitOpenMatch = segment.match(/OPEN\s*:\s*([^\n]+)\nDATE\s*:\s*([^\n]+)/i);

  const openMatch =
    splitOpenMatch ||
    // "OPEN TAIPEI / 22ND JULY 2025" — port then slash then date (common in period CP emails)
    segment.match(/OPEN\s+([A-Z][A-Z\s]{1,25}?)\s*\/\s*(\d{1,2}(?:ST|ND|RD|TH)?\s+[A-Z]+(?:[,.\s]+\d{4})?)/i) ||
    // "OPEN GANGAVARAM, ECI O/A 1ST-10TH JULY" - port with region and O/A date
    segment.match(/OPEN\s+([A-Z][A-Z\s,]+?)(?:\s+O\/A\s+|\s+ETA\s+|\s+SPOT\s+|\s+PROMPT\s+)/i) ||
    // NEW: Support "OPEN PORT DD-DD/MM" format like "OPEN HONG KONG 10-11/10" or "OPEN CAM PHA 16-20/10"
    segment.match(/OPEN\s+([A-Z\s]+?)\s+(\d{1,2})-(\d{1,2})\/(\d{1,2})(?:\s|,|;|$)/i) ||
    segment.match(/OPEN\s+(?:AT\s+)?(.+?)(?=\s+(?:O\/A|ON)\b)\s+(?:O\/A|ON)\s+([^\n]+)/i) ||
    segment.match(/OPEN\s+(?:AT\s+)?(.+?)\s+(\d{1,2}(?:ST|ND|RD|TH)?\s*[-–~\/]+\s*\d{1,2}(?:ST|ND|RD|TH)?\s+[A-Z]+(?:[,\.\s]+\d{4})?)/i) ||
    segment.match(/(?:WILL\s+)?OPEN\s+([A-Z]+(?:[,\s]+[A-Z]+)?)[,.]?\s*(\d{1,2}(?:TH|ST|ND|RD)?\s+[A-Z]+[,.\s]+\d{4})/i) ||
    segment.match(/OPEN\s+([A-Z]+)\s+(\d{1,2}[-\/]\d{1,2}\s+[A-Z]+)/i) ||
    // "OPEN PTO MONTT 23 OCT" / "OPEN STOCKTON 1 NOV" — port (multi-word) + DD MON
    segment.match(/OPEN\s+([A-Z][A-Z\s]{1,25}?)\s+(\d{1,2}\s+[A-Z]{3})\b/i);

  let openDate: string | null = null;
  let closeDate: string | null = null;
  let openPort: string | null = null;

  // New: explicit "Open Port: ...", "Open Date: ...", "Close Date: ..." lines
  let regionLocal: string | null = null;
  // Helper to sanitize date strings — reject placeholder dashes
  const sanitizeDate = (d: string | null) => (!d || /^[-—]+$/.test(d.trim())) ? null : d;
  const openPortLineMatch = segment.match(/OPEN\s*PORT\s*[:\-\s]+([^\r\n]+)/i);
  const openDateLineMatch = segment.match(/OPEN\s*DATE\s*[:\-\s]+([^\r\n]+)/i);
  const closeDateLineMatch = segment.match(/CLOSE\s*DATE\s*[:\-\s]+([^\r\n]+)/i);
  const regionLineMatch = segment.match(/REGION\s*[:\-\s]+([^\r\n]+)/i);
  if (openPortLineMatch) {
    const rawPort = openPortLineMatch[1].trim();
    openPort = rawPort && isValidPort(rawPort) ? resolvePort(rawPort) : rawPort;
  }
  if (openDateLineMatch) {
    let raw = openDateLineMatch[1].trim();
    raw = raw.replace(/[\-/]/g, " ").replace(/(\d{1,2})(?:st|nd|rd|th)/i, "$1").replace(/,/g, " ").trim();
    const lay = parseLaycan(raw);
    if (lay.start) openDate = lay.start;
    else {
      const dt = new Date(raw);
      if (!isNaN(dt.getTime())) openDate = dt.toISOString().split("T")[0];
    }
  }
  if (closeDateLineMatch) {
    let raw = closeDateLineMatch[1].trim();
    raw = raw.replace(/[\-/]/g, " ").replace(/(\d{1,2})(?:st|nd|rd|th)/i, "$1").replace(/,/g, " ").trim();
    const lay = parseLaycan(raw);
    // For an explicit CLOSE DATE label, always use the start date — not lay.end,
    // which parseLaycan auto-inflates by +5 days for single-date inputs.
    if (lay.start) closeDate = lay.start;
    else {
      const dt = new Date(raw);
      if (!isNaN(dt.getTime())) closeDate = dt.toISOString().split("T")[0];
    }
  }
  if (regionLineMatch) {
    const rawRegion = regionLineMatch[1].trim();
    regionLocal = rawRegion || null;
  }

  if (openMatch) {
    // Handle new "OPEN PORT DD-DD/MM" format separately
    // Pattern: /OPEN\s+([A-Z\s]+?)\s+(\d{1,2})-(\d{1,2})\/(\d{1,2})/
    const dateFormatMatch = openMatch[2] && /^\d{1,2}$/.test(openMatch[2]) && openMatch[4];
    if (dateFormatMatch && openMatch[2] && openMatch[3] && openMatch[4]) {
      // This is the "OPEN PORT DD-DD/MM" format
      const openDay = parseInt(openMatch[2], 10);
      const closeDay = parseInt(openMatch[3], 10);
      const month = parseInt(openMatch[4], 10);
      // Use email reference date for year inference — never use today's live date
      const monthStr = String(month).padStart(2, "0");
      const year = inferYear(monthStr);
      if (!openDate) openDate = `${year}-${monthStr}-${String(openDay).padStart(2, "0")}`;
      if (!closeDate) closeDate = `${year}-${monthStr}-${String(closeDay).padStart(2, "0")}`;
      
      // Extract port from first capture group
      const rawPort = openMatch[1].trim();
      const headerNoise = /\b(?:AS FOLLOWS|AS PER|PLEASE|PLS|PPSE|PROPOSE|PROPOSED|SUIT|SEE BELOW|KINDLY)\b/i;
      const words = rawPort.split(/\s+/).filter(Boolean).length;
      if (!openPort && rawPort && !headerNoise.test(rawPort) && words <= 4 && isValidPort(rawPort)) {
        openPort = resolvePort(rawPort);
      } else {
        openPort = null;
      }
    } else {
      // Standard openMatch processing for other date formats
      const dateStr = openMatch[2] ?? openMatch[1];
      const { start, end } = parseLaycan(dateStr);
      const fixed = fixDates(start, end);
      // Don't overwrite explicitly parsed open/close if we already found them above
      if (!openDate) openDate = fixed.open || null;
      if (!closeDate) closeDate = fixed.close || null;
      let rawPort = openMatch[1].trim();
      // Guard: reject broker header phrases like "AS FOLLOWS", "PLS", "PPSE" etc.
      const headerNoise = /\b(?:AS FOLLOWS|AS PER|PLEASE|PLS|PPSE|PROPOSE|PROPOSED|SUIT|SEE BELOW|KINDLY)\b/i;
      // Strip trailing prepositions like "ON", "AT", "IN" that get captured after the port
      rawPort = rawPort.replace(/\s+(?:ON|AT|IN|FOR)\s*$/i, "").trim();
      // Strip region prefix from compound expressions like "AG INT KUWAIT" → "KUWAIT"
      rawPort = stripRegionPrefix(rawPort);
      const words = rawPort.split(/\s+/).filter(Boolean).length;
      if (!openPort && rawPort && !headerNoise.test(rawPort) && words <= 4 && isValidPort(rawPort)) {
        openPort = resolvePort(rawPort);
      } else {
        openPort = null;
      }
    }
  }

  // Fallback port when no OPEN port found:
  // Priority: ETA port (vessel's upcoming position) > SAILED port (vessel's past position)
  if (!openPort) {
    // ETA port: "ETA NEWCASTLE ..." or "ETA SINGAPORE ..."
    const etaPortMatch = segment.match(/\bETA\s+([A-Z][A-Z\s]{1,20}?)(?:\s+\d{1,2}[-\/]\d|\s*,|\s*$)/im);
    if (etaPortMatch && etaPortMatch[1]) {
      const raw = etaPortMatch[1].trim().split(",")[0].trim();
      if (raw && isValidPort(raw)) openPort = resolvePort(raw);
    }
  }
  if (!openPort) {
    // LAST PORT or LPD fallback (not ETA — ETA already handled above)
    const lastPortMatch = segment.match(/(?:LAST\s+PORT|LPD)\s+([A-Z][A-Z\s,]+?)(?:\s+\d{1,2}[-\/]\d|\s*,|\s*$)/im);
    if (lastPortMatch && lastPortMatch[1]) {
      const raw = lastPortMatch[1].trim().split(",")[0].trim();
      if (raw && isValidPort(raw)) openPort = resolvePort(raw);
    }
  }
  if (!openPort) {
    // SAILED port is lowest priority (vessel already left that port)
    const sailedMatch = segment.match(/SAILED\s+([A-Z][A-Z\s]+?)(?:\s+\d{1,2}\/\d{1,2}|\s*,|\s*$)/im);
    if (sailedMatch && sailedMatch[1]) {
      const raw = sailedMatch[1].trim();
      if (raw && isValidPort(raw)) openPort = resolvePort(raw);
    }
  }

  // "Position:\nContinent\nEnd July" — dship / position-list newsletter format
  // This block appears AFTER the vessel spec with the open position and ETA date.
  if (!openPort || !openDate) {
    const positionBlockMatch = segment.match(/Position\s*[:\-]*\s*\n\s*([^\n]+?)\s*\n\s*([^\n]+)/i);
    if (positionBlockMatch) {
      const rawPort = positionBlockMatch[1].trim();
      const rawDate = positionBlockMatch[2].trim();
      if (!openPort) {
        const portUpper = rawPort.toUpperCase();
        if (isValidPort(rawPort) || REGION_MAP[portUpper] !== undefined) {
          openPort = REGION_MAP[portUpper]
            ? (PORT_ABBREVS[portUpper] ?? rawPort)
            : resolvePort(rawPort);
        }
      }
      if (!openDate) {
        const lay = parseLaycan(rawDate);
        if (lay.start) {
          openDate = lay.start;
          closeDate = closeDate || lay.end || null;
        }
      }
    }
  }

  const hasLaycanLabel = /\bLAYCAN\b/i.test(segment);
  const hasOaLabel = /\bO\/A\b/i.test(segment);
  let laycanStartDate: string | null = null;
  let laycanEndDate: string | null = null;
  // O/A on same line as MV: "OPEN GANGAVARAM, ECI O/A 1ST-10TH JULY, 2026"
  if (!openDate) {
    const oaInlineMatch = segment.match(/\bO\/A\s+([^\n]+)/i);
    if (oaInlineMatch) {
      const laycanRange = parseLaycan(oaInlineMatch[1].trim());
      if (laycanRange.start) { openDate = laycanRange.start; closeDate = closeDate || laycanRange.end || null; }
    }
  }

  // Additional open_date patterns not covered by openMatch
  if (!openDate) {
    // ISO date format: "2025-07-15" or "OPEN 2025-07-15"
    const isoDateMatch = segment.match(/\bOPEN(?:\s+(?:AT|IN|PORT))?\s+\S+\s+(\d{4}-\d{2}-\d{2})\b/i)
      || segment.match(/\bOPEN(?:\s+(?:AT|IN))?\s+(\d{4}-\d{2}-\d{2})\b/i);
    if (isoDateMatch) {
      const d = new Date(isoDateMatch[1]);
      if (!isNaN(d.getTime())) openDate = isoDateMatch[1];
    }
  }
  if (!openDate) {
    // DD/MM/YYYY or DD-MM-YYYY format with OPEN keyword only — never use ETA as open_date
    const ddmmyyyyMatch = segment.match(/\b(?:OPEN|AVAIL|AVAILABLE)\b[^\/\n]{0,30}?(\d{1,2})\/(\d{1,2})\/(\d{4})\b/i)
      || segment.match(/\b(?:OPEN|AVAIL|AVAILABLE)\b[^\/\n]{0,30}?(\d{1,2})-(\d{1,2})-(\d{4})\b/i);
    if (ddmmyyyyMatch) {
      const day = ddmmyyyyMatch[1].padStart(2, "0");
      const mon = ddmmyyyyMatch[2].padStart(2, "0");
      const yr = ddmmyyyyMatch[3];
      openDate = `${yr}-${mon}-${day}`;
    }
  }
  // NOTE: ETA is intentionally NOT used as open_date. ETA is informational only.
  // "ETA PORT DD/MM" fallback has been removed to prevent ETA dates from
  // incorrectly populating the open_date field.
  if (!openDate) {
    // SPOT / PROMPT / ASAP → use email reference date (not live today's date)
    if (/\b(?:SPOT|PROMPT|ASAP|IMMEDIATELY|NOW)\b/i.test(segment)) {
      const refDate = EMAIL_REFERENCE_DATE || new Date();
      openDate = refDate.toISOString().split("T")[0];
    }
  }

  const explicitLaycanMatch = segment.match(/(?:LAYCAN|O\/A)\s*[:\-\s]*([^\n]+)/i);

  if (!openDate && explicitLaycanMatch && explicitLaycanMatch[1]) {
    const laycanRange = parseLaycan(explicitLaycanMatch[1].trim());
    if (laycanRange.start) openDate = openDate || laycanRange.start;
    if (laycanRange.end) closeDate = closeDate || laycanRange.end;
    else if (!closeDate) closeDate = laycanRange.start;
  }
  if (explicitLaycanMatch && explicitLaycanMatch[1]) {
    const laycanRange = parseLaycan(explicitLaycanMatch[1].trim());
    if (laycanRange.start) laycanStartDate = laycanRange.start;
    if (laycanRange.end) laycanEndDate = laycanRange.end;
  }
  if ((!laycanStartDate || !laycanEndDate) && hasOaLabel && openMatch) {
    const dateStr = openMatch[2] ?? openMatch[1];
    const laycanRange = parseLaycan(dateStr);
    if (laycanRange.start) laycanStartDate = laycanStartDate || laycanRange.start;
    if (laycanRange.end) laycanEndDate = laycanEndDate || laycanRange.end;
  }

  const callSignMatch = segment.match(/\bCALL\s*SIGN\b\s*[:\-\s]*(\S+)/i) || segment.match(/\bCALLSIGN\b\s*[:\-\s]*(\S+)/i);
  const ownerMatch = segment.match(/\bOWNERS?\b\s*[:\-\s]*(.+)/i);
  const pniMatch = segment.match(/\bP&I\s+CLUB\b\s*[:\-\s]*(.+)/i);
  const inmarsatMatch = segment.match(/\bINMARSAT\b(?:\s*C)?\s*[:\-\s]*(.+)/i);
  const iridiumMatch = segment.match(/\bIRIDIUM(?:\s+TEL)?\b\s*[:\-\s]*(\+?[\d][\d\s\-().,]{5,30})/i);
  const starlinkMatch = segment.match(/\bSTARLINK(?:\s+TEL)?\b\s*[:\-\s]*(\+?[\d][\d\s\-().,]{5,30})/i);
  const lastCargoMatch = segment.match(/\bLAST\s+CARGO(?:ES)?\b\s*[:\-\s]*(.+)/i);
  const baleCapacityMatch = 
    segment.match(/\bBALE\s+CAPACITY\b\s*[:\-\s]*([\d,\.\s]+(?:CBM|CU\.?M|M3)?)/i)
    || segment.match(/\bBALE\s*(?:CAP(?:ACITY)?)?\s*[:\-]?\s*(?:ABT\.?\s*)([\d,\.\s]+(?:CBM|CU\.?M|M3)?)/i)
    || segment.match(/\bBALE\s+CAPACITY\b\s*[:\-\s]*(.+)/i);

  const callSign = callSignMatch ? callSignMatch[1].trim() : null;
  const owner = ownerMatch ? ownerMatch[1].split(/\r?\n/)[0].trim() : null;
  const pniClub = pniMatch ? pniMatch[1].split(/\r?\n/)[0].trim() : null;
  const inmarsat = inmarsatMatch ? inmarsatMatch[1].split(/\r?\n/)[0].trim() : null;
  const iridiumPhone = iridiumMatch ? iridiumMatch[1].trim() : null;
  const starlinkPhone = starlinkMatch ? starlinkMatch[1].trim() : null;
  const lastCargo = lastCargoMatch ? lastCargoMatch[1].split(/\r?\n/)[0].trim() : null;
  const baleCapacity = baleCapacityMatch ? baleCapacityMatch[1].split(/\r?\n/)[0].replace(/\bABT\b/i, "").trim() : null;

  const restrictions: string[] = [];
  const restrMatches = segment.match(PATTERNS.restriction);
  if (restrMatches) {
    restrictions.push(
      ...restrMatches
        .map(r => r.trim().replace(/\s*[()]+\s*$/, "").replace(/\s+/g, " ").trim())
        .filter(r => r.length > 4)
        .slice(0, 5)
    );
  }

  const technical = extractCommonTechnicalFields(segment);

  // Confidence scoring
  let conf = 0.40;
  if (vesselName) conf += 0.15;
  if (dwtStr) conf += 0.12;
  if (openPort) conf += 0.10;
  if (openDate) conf += 0.08;
  if (technical.imo) conf += 0.12;
  if (technical.built_year) conf += 0.06;
  if (technical.grt) conf += 0.04;
  if (technical.loa) conf += 0.04;
  if (technical.beam) conf += 0.04;
  if (technical.grain_capacity) conf += 0.05;
  if (technical.flag) conf += 0.04;
  if (resolveRegion(segment)) conf += 0.03;
  // Bonus for multiple technical fields
  const techFieldCount = [technical.imo, technical.built_year, technical.grt, technical.nrt, 
                          technical.loa, technical.beam, technical.grain_capacity, technical.flag]
                          .filter(f => !!f).length;
  if (techFieldCount >= 5) conf += 0.08;
  if (techFieldCount >= 7) conf += 0.05;

  const fields: ExtractedFields = {
    email_type: "Tonnage",
    tonnage_name: vesselName || null,
    tonnage_type: vesselType,
    dwt: dwtStr,
    port: openPort,
    open_date: sanitizeDate(openDate),
    close_date: sanitizeDate(closeDate),
    region: (openPort ? resolveRegion(openPort) : null) || (regionLocal && (resolveRegion(regionLocal) || regionLocal)) || null,
    matching_region: (openPort ? resolveRegion(openPort) : null) || (regionLocal && (resolveRegion(regionLocal) || regionLocal)) || null,
    pic: signature.pic,
    email_id: signature.email,
    phone_number: signature.phone,
    restriction: restrictions.length > 0 ? restrictions.join("; ") : null,
    bale_capacity: baleCapacity || null,
    call_sign: callSign || null,
    owner: owner || null,
    pni_club: pniClub || null,
    inmarsat: inmarsat || null,
    iridium_phone: iridiumPhone || null,
    starlink_phone: starlinkPhone || null,
    last_cargo: lastCargo || null,
    ...technical,
  };

  // Fallbacks: extract PIC / Email / Phone from the segment if signature missing
  if (!fields.pic) {
    const pm = segment.match(/\bPIC\b(?:[ \t]*[:\-][ \t]*|[ \t]+)([^\n\r]+)/i)
      || segment.match(/\bCONTACT\s*PERSON\b[:\-\s]*([^\n\r]+)/i)
      || segment.match(/\bATTN\b[:\-\s]*([^\n\r]+)/i)
      || segment.match(/\bATTENTION\b[:\-\s]*([^\n\r]+)/i);
    if (pm) {
      const candidate = pm[1].trim().split(/[,\|]/)[0].trim();
      if (candidate && !isGenericContactPhrase(candidate) && candidate.length <= 60) {
        fields.pic = candidate;
      }
    }
  }
  // Additional PIC fallback: look for a person name before or after an email address
  if (!fields.pic && fields.email_id) {
    const emailPattern = fields.email_id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nameBeforeEmail = segment.match(new RegExp(`([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)+)\\s+${emailPattern}`, 'i'));
    const nameAfterEmail = segment.match(new RegExp(`${emailPattern}\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)+)`, 'i'));
    const nameCandidate = (nameBeforeEmail || nameAfterEmail);
    if (nameCandidate && nameCandidate[1] && isLikelyPersonName(nameCandidate[1]) && !isGenericContactPhrase(nameCandidate[1])) {
      fields.pic = nameCandidate[1].trim();
    }
  }
  if (!fields.email_id) {
    const em = segment.match(/\bE-?MAIL\b[:\-\s]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/i)
      || segment.match(/([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/);
    if (em) fields.email_id = em[1].trim();
  }
  if (!fields.phone_number) {
    const ph = segment.match(/(?:Mobile|Phone|WhatsApp|Contact|Tel|Mob|Cell)\s*[:\/]?\s*([+\d][\d\s\-().]{6,24})/i)
      || segment.match(/(\+\d{1,3}[\s\-]?\d{3,}[\d\s\-]{6,})/);
    if (ph && isValidPhone(ph[1].trim())) fields.phone_number = ph[1].trim();
  }

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
    tonnage_name: f.tonnage_name ?? null,
    tonnage_type: f.tonnage_type ?? "Bulk Carrier",
    port: openPort || null,
    region: f.region ?? f.matching_region ?? null,
    matching_region: f.matching_region ?? null,
    open_date: openDate ?? null,
    close_date: closeDate ?? null,
    dwt,
    pic: f.pic ?? null,
    email_id: f.email_id ?? null,
    phone_number: f.phone_number ?? null,
    latitude: f.latitude ?? null,
    longitude: f.longitude ?? null,
    flag: f.flag ?? null,
    imo: f.imo ?? null,
    grt: f.grt ?? null,
    nrt: f.nrt ?? null,
    loa: f.loa ?? null,
    beam: f.beam ?? null,
    tpc: f.tpc ?? null,
    grain_capacity: f.grain_capacity ?? null,
    built_year: f.built_year ?? null,
    bale_capacity: f.bale_capacity ?? null,
    depth: f.depth ?? null,
    draft: f.draft ?? null,
    lbp: f.lbp ?? null,
    class: f.class_notation ?? null,
    holds: f.holds ?? null,
    hatches: f.hatches ?? null,
    cranes: f.cranes ?? null,
    grabs: f.grabs ?? null,
    speed: f.speed ?? null,
    consumption: f.consumption ?? null,
    gear: f.gear ?? null,
    registry_port: f.registry_port ?? null,
    builder: f.builder ?? null,
    call_sign: f.call_sign ?? f.callsign ?? null,
    owner: f.owner ?? null,
    pni_club: f.pni_club ?? null,
    inmarsat: f.inmarsat ?? null,
    iridium_phone: f.iridium_phone ?? null,
    starlink_phone: f.starlink_phone ?? null,
    last_cargo: f.last_cargo ?? null,
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
    account_name: f.account_name ?? null,
    cargo_name: cargo || null,
    cargo_type: cargo ? (f.cargo_type ?? null) : null,
    min_size: f.min_size !== null && f.min_size !== undefined ? String(Math.round(f.min_size)) : null,
    max_size: f.max_size !== null && f.max_size !== undefined ? String(Math.round(f.max_size)) : null,
    del_port: delPort || null,
    redel_port: redelPort || null,
    laycan_start_date: laycanStart ?? null,
    laycan_end_date: laycanEnd ?? null,
    duration: f.duration ?? null,
    email_id: f.email_id ?? null,
    phone_number: f.phone_number ?? null,
    latitude: f.latitude ?? null,
    longitude: f.longitude ?? null,
    region: f.region ?? f.matching_region ?? null,
    matching_region: f.matching_region ?? null,
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
    cargo_name: cargo || null,
    cargo_type: cargo ? (f.cargo_type ?? "Dry Bulk") : null,
    account_name: f.account_name ?? null,
    min_size: f.min_size !== null && f.min_size !== undefined ? String(Math.round(f.min_size)) : null,
    max_size: f.max_size !== null && f.max_size !== undefined ? String(Math.round(f.max_size)) : null,
    load_port: loadPort || null,
    discharge_port: dischargePort || null,
    laycan_start_date: laycanStart ?? null,
    laycan_end_date: laycanEnd ?? null,
    email_id: f.email_id ?? null,
    phone_number: f.phone_number ?? null,
    latitude: f.latitude ?? null,
    longitude: f.longitude ?? null,
    load_rate: f.load_rate ?? null,
    discharge_rate: f.discharge_rate ?? null,
    commission: f.commission ?? null,
    region: f.region ?? f.matching_region ?? null,
    matching_region: f.matching_region ?? null,
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
    if (t.port && !isValidPort(t.port)) t.port = null;
    if (t.dwt) { const n = parseInt(t.dwt, 10); if (isNaN(n) || n < 1000) t.dwt = null; }
    if (t.open_date && t.close_date) {
      const { open, close } = fixDates(t.open_date, t.close_date);
      t.open_date = open; t.close_date = close;
    }
    t.restrictions = t.restrictions.filter(r => r.trim().length > 3);
    t.confidence_score = Math.max(0, Math.min(1, t.confidence_score));
  } else if (out.email_type === "TC") {
    const t = out as TCEntry;
    if (t.del_port && !isValidPort(t.del_port)) t.del_port = null;
    if (t.redel_port && !isValidPort(t.redel_port)) t.redel_port = null;
    if (t.cargo_name && !isValidCargo(t.cargo_name)) { t.cargo_name = null; t.cargo_type = null; }
    if (t.laycan_start_date && t.laycan_end_date) {
      const { open, close } = fixDates(t.laycan_start_date, t.laycan_end_date);
      t.laycan_start_date = open; t.laycan_end_date = close;
    }
    t.restrictions = t.restrictions.filter(r => r.trim().length > 3);
    t.confidence_score = Math.max(0, Math.min(1, t.confidence_score));
  } else if (out.email_type === "VC") {
    const t = out as VCEntry;
    if (t.load_port && !isValidPort(t.load_port)) t.load_port = null;
    if (t.discharge_port && !isValidPort(t.discharge_port)) t.discharge_port = null;
    if (t.cargo_name && !isValidCargo(t.cargo_name)) { t.cargo_name = null; t.cargo_type = null; }
    if (t.laycan_start_date && t.laycan_end_date) {
      const { open, close } = fixDates(t.laycan_start_date, t.laycan_end_date);
      t.laycan_start_date = open; t.laycan_end_date = close;
    }
    t.restrictions = t.restrictions.filter(r => r.trim().length > 3);
    t.confidence_score = Math.max(0, Math.min(1, t.confidence_score));
  }

  return out;
}

// ─── Main Extraction Functions ────────────────────────────────────────────────
const GENERIC_CONTACT_TOKENS = new Set([
    "KINDLY", "PLEASE", "ADVISE", "UPDATE", "INFORMATION", "THANKS", "REGARDS", "YOURS", "SINCERELY", "DEAR",
    "CONTACT", "EMAIL", "PHONE", "MOBILE", "WHATSAPP", "FAX", "TEL", "CALL", "REQUEST", "OFFER", "AVAILABLE",
    "DAILY", "ADVICE", "NOTE", "INTEREST", "INTERST", "PIC", "ACCOUNT", "NAME", "FIXTURE", "REF",
    "LOAD", "PORT", "DISCHARGE", "CARGO", "OPEN", "CLOSE", "DRAFT", "SHIP", "VESSEL", "DECK"
]);

function normalizeContactCandidate(value: any): string {
    if (value === null || value === undefined) return "";
    return String(value).trim().replace(/\s+/g, " ");
}

function isGenericContactPhrase(contact: string): boolean {
    const normalized = contact.trim();
    const upper = normalized.toUpperCase();
    if (/\b(?:KINDLY\s+ADVISE|PLEASE\s+ADVISE|ADVISE\s+YOUR|YOUR\s+INTER(?:ST|EST)|THANKS?\s+AND\s+REGARDS?|ACCOUNT\s+NAME|DECK\s+PIC)\b/.test(upper)) {
        return true;
    }

    const words = upper.split(/\s+/).filter(Boolean);
    const genericCount = words.filter(word => GENERIC_CONTACT_TOKENS.has(word.replace(/[.,]/g, ""))).length;
    if (genericCount >= Math.ceil(words.length * 0.5)) return true;

    return false;
}

function isLikelyPersonName(value: any): boolean {
    const contact = normalizeContactCandidate(value);
    if (!contact) return false;
    if (contact.length < 4 || contact.length > 60) return false;
    if (/[@\d]/.test(contact)) return false;
    if (isGenericContactPhrase(contact)) return false;

    const words = contact.split(/\s+/).filter(Boolean);
    if (words.length < 2 || words.length > 6) return false;
    if (words.some(word => /^[^A-Za-z.\-']/.test(word))) return false;

    const isInitial = (word: string) => /^[A-Z]\.?$/.test(word);
    const isTitle = (word: string) => /^(?:MR|MRS|MS|MISS|DR|CAPT|CAPTAIN|CHIEF|PROF)\.?$/i.test(word);
    const isProperName = (word: string) => /^[A-Z][a-z]+(?:[-'][A-Z][a-z]+)*$/.test(word);
    const isSurname = (word: string) => /^[A-Z]{2,}$/.test(word) && word.length >= 2;

    const hasProperName = words.some(isProperName);
    const hasSurname = words.some(isSurname);
    const hasTitle = words.some(isTitle);
    const initialCount = words.filter(isInitial).length;

    if (hasProperName && (hasSurname || words.length >= 2)) return true;
    if (hasTitle && (hasSurname || initialCount >= 1)) return true;
    if (initialCount >= 1 && hasSurname) return true;

    return false;
}

function mergeML(
    fields: any,
    ml: any,
    segment: string,
    segmentType: EntryType
) {
    if (!ml) {
        return fields;
    }

    const upper = segment.toUpperCase();

    const asString = (value: any): string => {
        if (typeof value === "string") return value.trim();
        if (Array.isArray(value) && value.length > 0) return String(value[0]).trim();
        if (value === null || value === undefined) return "";
        return String(value).trim();
    };

    const mlCargo = asString(ml.CARGO);
    const mlVessel = asString(ml.VESSEL);
    const mlPort = asString(ml.PORT);
    const mlEta = asString(ml.ETA);
    const mlLaycan = asString(ml.LAYCAN);
    const mlOpenDate = asString(ml.OPEN_DATE);
    const mlCloseDate = asString(ml.CLOSE_DATE);
    const mlCallSign = asString(ml.CALL_SIGN || ml.CALLSIGN);
    const mlOwner = asString(ml.OWNER);
    const mlPNI = asString(ml.PNI_CLUB);
    const mlInmarsat = asString(ml.INMARSAT);
    const mlIridium = asString(ml.IRIDIUM_PHONE);
    const mlStarlink = asString(ml.STARLINK_PHONE);
    const mlLastCargo = asString(ml.LAST_CARGO);
    const mlBaleCapacity = asString(ml.BALE_CAPACITY);
    const mlContact = normalizeContactCandidate(ml.CONTACT);

    const phraseInSegment = (value: string | undefined): boolean =>
        typeof value === "string" && value.trim().length > 0 && upper.includes(value.trim().toUpperCase());

    const hasCargoHint = /\bCARGO\b|\bCOMMODIT(?:Y|IES)?\b|\bFREIGHT\b|\bLOAD\s*PORT\b|\bDISCHARGE\s*PORT\b|\bPOL\b|\bPOD\b/i.test(segment);
    const hasTonnageHint = /\bOPEN\b|\bO\/A\b|\bOPEN\s+AT\b|\bDWT\b|\bIMO\b|\bBUILT\b|\bBLT\b|\bFLAG\b/.test(upper);
    const hasLaycanHint = /\bLAYCAN\b|\bO\/A\b|\bOPEN\b|\bETA\b/.test(upper);
    const hasVesselHint = /\bM[TV]\b|\bM\/V\b|\bVESSEL\b/.test(upper);

    if (
        !fields.cargo_name &&
        mlCargo &&
        segmentType !== "Tonnage" &&
        (phraseInSegment(mlCargo) || hasCargoHint)
    ) {
        fields.cargo_name = mlCargo;
    }

    if (!fields.account_name && ml.CHARTERER && /\bCHARTERER\b|\bACCT\b|\bA\/C\b/i.test(segment))
        fields.account_name = ml.CHARTERER;

    if (
        !fields.laycan_start_date &&
        mlLaycan &&
        /\d/.test(mlLaycan) &&
        hasLaycanHint
    ) {
        const parsed = parseLaycan(mlLaycan);
        if (parsed.start) fields.laycan_start_date = parsed.start;
        if (parsed.end) fields.laycan_end_date = parsed.end;
        else if (!fields.laycan_end_date) fields.laycan_end_date = parsed.start;
    }

    if (
        !fields.laycan_end_date &&
        mlLaycan &&
        /\d/.test(mlLaycan) &&
        hasLaycanHint
    ) {
        const parsed = parseLaycan(mlLaycan);
        if (parsed.end) fields.laycan_end_date = parsed.end;
        else if (!fields.laycan_end_date) fields.laycan_end_date = parsed.start;
    }

    if (
        fields.email_type === "VC" &&
        !fields.load_port &&
        ml.LOAD_PORT &&
        ml.LOAD_PORT !== "/" &&
        (phraseInSegment(ml.LOAD_PORT) || /\bLOAD\s*PORT\b|\bPOL\b/i.test(segment))
    ) {
        fields.load_port = ml.LOAD_PORT;
    }

    if (
        !fields.port &&
        mlPort &&
        fields.email_type === "Tonnage" &&
        (phraseInSegment(mlPort) || hasTonnageHint)
    ) {
        fields.port = mlPort;
    }

    if (
        fields.email_type === "VC" &&
        !fields.discharge_port &&
        ml.DISCHARGE_PORT &&
        ml.DISCHARGE_PORT !== "/" &&
        (phraseInSegment(ml.DISCHARGE_PORT) || /\bDISCHARGE\s*PORT\b|\bPOD\b/i.test(segment))
    ) {
        fields.discharge_port = ml.DISCHARGE_PORT;
    }

    if (
        !fields.del_port &&
        ml.LOAD_PORT &&
        fields.email_type === "VC" &&
        (phraseInSegment(ml.LOAD_PORT) || /\bLOAD\s*PORT\b|\bPOL\b/i.test(segment))
    ) {
        fields.del_port = ml.LOAD_PORT;
    }

    if (
        !fields.redel_port &&
        fields.email_type === "VC" &&
        ml.DISCHARGE_PORT &&
        (phraseInSegment(ml.DISCHARGE_PORT) || /\bDISCHARGE\s*PORT\b|\bPOD\b/i.test(segment))
    ) {
        fields.redel_port = ml.DISCHARGE_PORT;
    }

    const hasContactHint = /\b(?:CONTACT|EMAIL|E-MAIL|MOBILE|PHONE|WHATSAPP|TEL|FAX)\b/i.test(segment);
    if (!fields.email_id && mlContact && /@/.test(mlContact) && hasContactHint)
        fields.email_id = mlContact;

    if (!fields.pic && mlContact && !/@/.test(mlContact) && hasContactHint && isLikelyPersonName(mlContact))
        fields.pic = mlContact;

    if (!fields.phone_number && mlContact && /\d/.test(mlContact) && hasContactHint)
        fields.phone_number = mlContact;

    if (!fields.owner && mlOwner && hasContactHint)
        fields.owner = mlOwner;

    if (!fields.pni_club && mlPNI)
        fields.pni_club = mlPNI;

    if (!fields.inmarsat && mlInmarsat)
        fields.inmarsat = mlInmarsat;

    if (!fields.iridium_phone && mlIridium)
        fields.iridium_phone = mlIridium;

    if (!fields.starlink_phone && mlStarlink)
        fields.starlink_phone = mlStarlink;

    if (!fields.call_sign && mlCallSign)
        fields.call_sign = mlCallSign;

    if (!fields.last_cargo && mlLastCargo)
        fields.last_cargo = mlLastCargo;

    if (!fields.bale_capacity && mlBaleCapacity)
        fields.bale_capacity = mlBaleCapacity;

    if (
        !fields.tonnage_name &&
        mlVessel &&
        segmentType === "Tonnage" &&
        phraseInSegment(mlVessel)
    ) {
        fields.tonnage_name = mlVessel;
    }

    if (
        !fields.tonnage_type &&
        ml.VESSEL_TYPE &&
        segmentType === "Tonnage" &&
        phraseInSegment(ml.VESSEL_TYPE)
    ) {
        fields.tonnage_type = ml.VESSEL_TYPE;
    }

    if (
        !fields.open_date &&
        mlOpenDate &&
        segmentType === "Tonnage" &&
        phraseInSegment(mlOpenDate)
    ) {
        fields.open_date = mlOpenDate;
    }

    if (
        !fields.close_date &&
        mlCloseDate &&
        segmentType === "Tonnage" &&
        phraseInSegment(mlCloseDate)
    ) {
        fields.close_date = mlCloseDate;
    }

    // NOTE: ML ETA is intentionally NOT used to populate open_date.
    // ETA is informational only; open_date must come from an explicit OPEN keyword.

    // Additional ML fallbacks for Tonnage: parse numeric ranges and fill DWT/PORT when missing
    if (segmentType === "Tonnage") {
      // ETA is NOT used as open_date — block intentionally removed.

      if (!fields.laycan_start_date && !fields.laycan_end_date && mlLaycan && /\\d/.test(mlLaycan) && hasLaycanHint) {
        const parsed = parseLaycan(mlLaycan);
        if (parsed.start) fields.laycan_start_date = parsed.start;
        if (parsed.end) fields.laycan_end_date = parsed.end;
        else if (!fields.laycan_end_date) fields.laycan_end_date = parsed.start;
      }

      if (!fields.port && mlPort && (phraseInSegment(mlPort) || hasTonnageHint)) fields.port = mlPort;

      if (!fields.dwt && ml.DWT && (phraseInSegment(ml.DWT) || hasTonnageHint)) {
        const v = ('' + ml.DWT).replace(/[^0-9Kk.,]/g, '').trim();
        const kMatch = v.match(/(\d+(?:[.,]\d+)?)\s*[Kk]/);
        if (kMatch) fields.dwt = String(Math.round(parseFloat(kMatch[1].replace(/,/g, '.')) * 1000));
        else fields.dwt = v.replace(/[.,]/g, '');
      }
    }

    if (
        !fields.dwt &&
        ml.DWT &&
        segmentType === "Tonnage" &&
        /\bDWT\b/.test(upper)
    ) {
        fields.dwt = ml.DWT;
    }

    if (!fields.imo && ml.IMO && /\bIMO\b/.test(upper))
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
  // Preserve a version of the normalized text for signature/contact extraction
  const normalizedForSignature = sanitizeEmail(normalizeEmailText(emailText));

  // Set reference date from email headers for year inference in laycan parsing
  setEmailReferenceDate(emailText);

  const preprocessed =
      sanitizeEmail(
          preprocessEmail(emailText)
      );

let mlResult: any = {};

try {

    mlResult =
    runMLModel(preprocessed);

    if (
        mlResult &&
        mlResult.PURE_ML_OUTPUT
    ) {
        mlResult =
        mlResult.PURE_ML_OUTPUT;
    }

}

  catch (err) {
    console.error(
        "ML failed:",
        err
    );

    mlResult = {};
  }
  // Extract signature/contact info from the un-stripped normalized text so
  // mobile footer/email address removals do not strip useful contact info.
  const signature = extractSignature(normalizedForSignature);
  // Prefer chartering / charter emails when multiple addresses present
  const best = pickBestEmail(normalizedForSignature);
  if (best) signature.email = best;
  const bestPhone = pickBestPhone(normalizedForSignature);
  if (bestPhone) signature.phone = bestPhone;
  const allSegments = segmentEmail(preprocessed, true);
  const techSegments = allSegments.filter(isTechnicalProfileSegment);
  let segments = allSegments.filter(segment => !isTechnicalProfileSegment(segment));
  
  // IMPORTANT: Merge technical segments with main segments to preserve contact info
  // Technical segments often contain CALL SIGN, P&I CLUB, OWNER, INMARSAT, etc.
  // Append tech segments to main segments so all extraction happens
  if (techSegments.length > 0 && segments.length > 0) {
    // Merge first tech segment with first tonnage segment to get all contact info
    segments[0] = (segments[0] + "\n\n" + techSegments[0]).trim();
  } else if (techSegments.length > 0) {
    // If only tech segments, use them as main segments
    segments = techSegments;
  }
  
  const entries: ExtractedEntry[] = [];
  const typesFound = new Set<EntryType>();
  const template = detectTemplate(preprocessed);
  const pipeline: Pipeline = template.name ? "template" : "rule-based";

  for (const segment of segments) {
    const segType = detectSegmentType(segment);
    if (!segType) continue;

    let entry: ExtractedEntry;
    if (segType === "VC") entry = extractVCEntry(segment, signature);
    else if (segType === "TC") entry = extractTCEntry(segment, signature);
    
    else entry = extractTonnageEntry(segment, signature);
    entry.fields = mergeML(
        entry.fields,
        mlResult,
        segment,
        segType
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
    // Try detectSegmentType first for type information
    let fallbackType: EntryType | null = null;
    const fullEmailType = detectSegmentType(preprocessed);
    
    // If no type detected from the full email, default to Tonnage (most common case)
    if (fullEmailType) {
      fallbackType = fullEmailType;
    } else {
      // Default to Tonnage if we can detect it's a trading/vessel email at all
      if (/\b(?:OPEN|OPEN\s+AT|O\/A|DWT|IMO|M\/?V\b)\b/i.test(preprocessed)) {
        fallbackType = "Tonnage";
      }
    }
    
    if (fallbackType) {
      let entry: ExtractedEntry;
      if (fallbackType === "VC") entry = extractVCEntry(preprocessed, signature);
      else if (fallbackType === "TC") entry = extractTCEntry(preprocessed, signature);
      else entry = extractTonnageEntry(preprocessed, signature);
      entry.fields = mergeML(
         entry.fields,
         mlResult,
         preprocessed,
         fallbackType
      );
      entries.push(entry);
     if (fallbackType) {
   typesFound.add(fallbackType);
    }
    }
  }

  // Merge technical profile data into tonnage entries
  // Search for technical blocks in the full email that correspond to each vessel
  try {
    for (const entry of entries) {
      if (entry.entryType !== 'Tonnage' || !entry.fields.tonnage_name) continue;
      
      const vesselName = entry.fields.tonnage_name.toUpperCase();
      
      // Search for a technical block matching this vessel in the entire preprocessed text
      // Look for patterns like "PROTEAS\nLIBERIA FLAG\nBUILT 2010..."
      const patterns = [
        new RegExp(`\\b${vesselName}\\b[\\s\\S]*?(?=\\n\\s*(?:${vesselName}|[A-Z]{2,}\\s+FLAG|LIBERIA|CYPRUS|PANAMA)|$)`, 'i'),
        new RegExp(`(?:^|\\n)${vesselName}[\\s\\S]*?(?=\\n\\s*[+\\-=]{2,}|$)`, 'im'),
      ];
      
      for (const pattern of patterns) {
        const match = preprocessed.match(pattern);
        if (match) {
          const technical = extractCommonTechnicalFields(match[0]);
          // Merge technical fields into entry if not already present
          const techKeys: (keyof ExtractedFields)[] = ['imo','grt','nrt','loa','beam','grain_capacity','built_year','flag'];
          for (const k of techKeys) {
            // @ts-ignore
            if ((!entry.fields[k] || entry.fields[k] === null) && (technical as any)[k]) {
              // @ts-ignore
              entry.fields[k] = (technical as any)[k];
            }
          }
          break;
        }
      }
    }
  } catch (err) {
    // Technical data merge failed silently, continue with existing data
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

// ─── Vessel Validation ─────────────────────────────────────────────────────

function isValidVessel(entry: EnterpriseEntry): boolean {
  if (entry.email_type === "Tonnage") {
    const t = entry as TonnageEntry;
    // Minimum requirements: at least one of these must be non-empty
    const hasName = !!t.tonnage_name && t.tonnage_name.trim() !== "";
    const hasDwt = !!t.dwt && t.dwt.trim() !== "" && t.dwt !== "0";
    const hasPort = !!t.port && t.port.trim() !== "";
    const hasImo = !!t.imo && t.imo.trim() !== "";
    
    // Must have at least one key identifier
    return hasName || hasDwt || hasPort || hasImo;
  } else if (entry.email_type === "TC") {
    const t = entry as TCEntry;
    const hasCargo = !!t.cargo_name && t.cargo_name.trim() !== "";
    const hasDelPort = !!t.del_port && t.del_port.trim() !== "";
    const hasRedelPort = !!t.redel_port && t.redel_port.trim() !== "";
    const hasLaycan = !!(t.laycan_start_date || t.laycan_end_date);
    
    return hasCargo || hasDelPort || hasRedelPort || hasLaycan;
  } else if (entry.email_type === "VC") {
    const t = entry as VCEntry;
    const hasCargo = !!t.cargo_name && t.cargo_name.trim() !== "";
    const hasLoadPort = !!t.load_port && t.load_port.trim() !== "";
    const hasDischargePort = !!t.discharge_port && t.discharge_port.trim() !== "";
    const hasLaycan = !!(t.laycan_start_date || t.laycan_end_date);
    
    return hasCargo || hasLoadPort || hasDischargePort || hasLaycan;
  }
  
  return true;
}

// Compulsory fields that must always be present (as null if not extracted)
const TONNAGE_COMPULSORY = new Set([
  "email_type","tonnage_name","tonnage_type","port","region","matching_region",
  "open_date","close_date","dwt","pic","email_id","phone_number",
]);
const VC_COMPULSORY = new Set([
  "email_type","cargo_name","cargo_type","account_name","min_size","max_size",
  "region","matching_region","load_port","discharge_port",
  "laycan_start_date","laycan_end_date","email_id","phone_number",
]);
const TC_COMPULSORY = new Set([
  "email_type","cargo_name","cargo_type","account_name","min_size","max_size",
  "region","matching_region","del_port","redel_port",
  "laycan_start_date","laycan_end_date","duration","email_id","phone_number",
]);

function enforceCompulsorySchema(entry: EnterpriseEntry): EnterpriseEntry {
  const out: any = { ...entry };
  let compulsory: Set<string>;
  if (out.email_type === "Tonnage") compulsory = TONNAGE_COMPULSORY;
  else if (out.email_type === "TC") compulsory = TC_COMPULSORY;
  else compulsory = VC_COMPULSORY;

  // Ensure every compulsory field is present (null if missing/empty)
  for (const field of compulsory) {
    if (!(field in out) || out[field] === undefined || out[field] === "") {
      out[field] = null;
    }
  }

  // Enforce open_date + 5 day rule for Tonnage
  if (out.email_type === "Tonnage" && out.open_date && !out.close_date) {
    try {
      const d = new Date(out.open_date);
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + 5);
        out.close_date = d.toISOString().split("T")[0];
      }
    } catch {}
  }

  // Enforce laycan_start_date + 5 day rule for VC and TC
  if ((out.email_type === "VC" || out.email_type === "TC") && out.laycan_start_date && !out.laycan_end_date) {
    try {
      const d = new Date(out.laycan_start_date);
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + 5);
        out.laycan_end_date = d.toISOString().split("T")[0];
      }
    } catch {}
  }

  return out as EnterpriseEntry;
}

function cleanEntry(entry: EnterpriseEntry): EnterpriseEntry {
  const cleaned: any = { ...entry };
  let compulsory: Set<string>;
  if (cleaned.email_type === "Tonnage") compulsory = TONNAGE_COMPULSORY;
  else if (cleaned.email_type === "TC") compulsory = TC_COMPULSORY;
  else compulsory = VC_COMPULSORY;

  // For non-compulsory fields: remove null/empty. For compulsory fields: keep as null.
  Object.keys(cleaned).forEach(key => {
    if (compulsory.has(key)) return; // Always keep compulsory fields even if null
    const val = cleaned[key];
    if (val === null || val === undefined) {
      delete cleaned[key];
      return;
    }
    if (typeof val === 'string' && val.trim() === '') {
      delete cleaned[key];
      return;
    }
    if (Array.isArray(val) && val.length === 0) {
      delete cleaned[key];
      return;
    }
  });
  return cleaned as EnterpriseEntry;
}

export function extractToEnterpriseJSON(emailText: string): EnterpriseEntry[] {
  const result = extractMaritimeEmail(emailText);
  const converted = result.extractedEntries
    .map(toEnterpriseEntry)
    .map(validateEnterpriseEntry)
    .filter(isValidVessel)
    .map(enforceCompulsorySchema)
    .map(cleanEntry);

  // ── Email-level type classification: always deterministic ──────────────────
  // 1. Compute weighted scores on the full email text (most reliable signal)
  const emailScores = computeTypeScores(emailText);
  const weightedType: EntryType = classifyEmailType(emailText);

  // 2. Determine the type found from segment extraction
  let segmentType = result.emailType; // "Tonnage"|"VC"|"TC"|"Mixed"|"Unknown"

  // 3. Resolve final type:
  //    - If segments are unambiguous (single type found), trust them
  //    - If Mixed or Unknown, use the weighted classifier
  //    - Always prefer TC when strong TC signals (DEL+REDEL+HIRE) are present
  let finalEmailType: EmailType;

  const hasStrongTC = emailScores.tc >= 10 && emailScores.tc > emailScores.vc && emailScores.tc > emailScores.tonnage;
  const hasStrongVC = emailScores.vc >= 8 && emailScores.vc > emailScores.tc && emailScores.vc > emailScores.tonnage;
  const hasStrongTonnage = emailScores.tonnage >= 8 && emailScores.tonnage > emailScores.vc && emailScores.tonnage > emailScores.tc;

  // Mixed emails (explicitly identified by segment extraction) always keep all entries —
  // they must be resolved before any strong-signal override, which is single-type biased.
  if (segmentType === "Mixed") {
    finalEmailType = "Mixed";
  } else if (hasStrongTC) {
    finalEmailType = "TC";
  } else if (hasStrongVC && segmentType !== "TC") {
    finalEmailType = "VC";
  } else if (hasStrongTonnage && segmentType !== "TC" && segmentType !== "VC") {
    finalEmailType = "Tonnage";
  } else if (segmentType === "Unknown") {
    finalEmailType = weightedType as EmailType;
  } else {
    finalEmailType = segmentType as EmailType;
  }

  // 4. Filter entries to match the determined email type
  let filtered: EnterpriseEntry[];
  if (finalEmailType === "Mixed") {
    // For mixed emails (e.g. Tonnage positions + VC cargo), keep all valid entries
    filtered = converted;
  } else if (finalEmailType === "Tonnage") {
    filtered = converted.filter(e => e.email_type === "Tonnage");
    // Fallback: if no Tonnage entries but we have others, re-evaluate
    if (filtered.length === 0 && converted.length > 0) {
      const fallback = classifyEmailType(emailText);
      filtered = converted.filter(e => e.email_type === fallback);
      if (filtered.length === 0) filtered = converted;
    }
  } else if (finalEmailType === "VC") {
    filtered = converted.filter(e => e.email_type === "VC");
    if (filtered.length === 0 && converted.length > 0) filtered = converted;
  } else if (finalEmailType === "TC") {
    filtered = converted.filter(e => e.email_type === "TC");
    if (filtered.length === 0 && converted.length > 0) filtered = converted;
  } else {
    filtered = converted;
  }

  // 5. Ensure email_type is set correctly on every entry
  // IMPORTANT: After changing email_type, re-enforce compulsory schema for the new type
  // so that all compulsory fields for the final type are present (as null if not extracted).
  for (const e of filtered) {
    if (e.email_type !== finalEmailType && finalEmailType !== "Mixed") {
      (e as any).email_type = finalEmailType;
      // Re-enforce compulsory schema for the new type
      const reEnforced = enforceCompulsorySchema(e);
      Object.assign(e, reEnforced);
    }
  }

  // Deduplicate entries by stable key
  const seen = new Set<string>();
  function stableStringify(obj: any) {
    if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
    const out: any = {};
    Object.keys(obj).sort().forEach(k => { out[k] = obj[k]; });
    return JSON.stringify(out);
  }

  const deduped: EnterpriseEntry[] = [];
  for (const e of filtered) {
    const key = stableStringify(e);
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(e);
    }
  }
  return deduped;
}

export function extractEmailWithBody(emailText: string): { email_body: string; final_extracted_output: EnterpriseEntry[] } {
  return {
    email_body: cleanEmailBody(emailText),
    final_extracted_output: extractToEnterpriseJSON(emailText),
  };
}



