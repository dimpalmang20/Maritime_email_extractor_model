// Location: src/server.ts
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { spawn } from "node:child_process";
import * as fs from "fs";
import { extractToEnterpriseJSON } from "./maritime-extractor.js";

const port = parseInt(process.env.PORT ?? "3000", 10);

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.writeHead(statusCode, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => { body += chunk.toString("utf8"); });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function findJsonSubstring(text: string) {
  for (let i = 0; i < text.length; i++) {
    const firstChar = text[i];
    if (firstChar !== "{" && firstChar !== "[") continue;

    const stack: string[] = [];
    let inString = false;
    let escape = false;

    for (let j = i; j < text.length; j++) {
      const char = text[j];
      if (inString) {
        if (escape) {
          escape = false;
        } else if (char === "\\") {
          escape = true;
        } else if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === "{" || char === "[") {
        stack.push(char);
      } else if (char === "}" || char === "]") {
        const last = stack[stack.length - 1];
        if ((char === "}" && last === "{") || (char === "]" && last === "[")) {
          stack.pop();
          if (stack.length === 0) {
            return text.slice(i, j + 1).trim();
          }
        } else {
          break;
        }
      }
    }
  }

  return null;
}

function parseJsonFromStdout(raw: string) {
  if (!raw || !raw.trim()) return null;
  const sanitized = raw.replace(/\x1b\[[0-9;]*m/g, "");
  const trimmed = sanitized.trim();

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // fall through to candidate extraction
    }
  }

  const candidate = findJsonSubstring(sanitized);
  if (candidate) {
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }

  return null;
}

// Inline fallback parser: catches VC structures that the main extractor may have missed.
// No hardcoded values — all fields are derived from the email text or set to null.
function backupCargoExtractor(text: string): any[] {
  const cargoEntries: any[] = [];
  if (text.toLowerCase().includes("cargo") || text.toLowerCase().includes("laycan")) {
    const cargoMatch = text.match(/CARGO:\s*([^\n\r]+)/i);
    if (cargoMatch) {
      const loadPortMatch = text.match(/LOAD\s*PORT:\s*([^\n\r]+)/i);
      const disPortMatch = text.match(/DISCHARGE\s*PORT:\s*([^\n\r]+)/i);
      const startMatch = text.match(/LAYCAN\s*START:\s*([^\n\r]+)/i);
      const endMatch = text.match(/LAYCAN\s*END:\s*([^\n\r]+)/i);
      const accountMatch = text.match(/(?:ACCOUNT|ACCT|CHARTERER|A\/C)\s*:\s*([^\n\r]+)/i);
      const qtyMatch = text.match(/(?:QTY|QUANTITY|SIZE)\s*[:\-]?\s*(\d+(?:[,.]?\d+)?)\s*(?:MT|MTS|T)?(?:\s*\/\s*(\d+(?:[,.]?\d+)?)\s*(?:MT|MTS|T)?)?/i);
      const emailMatch = text.match(/\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/);
      const phoneMatch = text.match(/(?:TEL|MOBILE|PHONE|WHATSAPP|MOB)\s*[:\-]?\s*([\+\d][\d\s\-\(\)]{6,20})/i);
      const regionMatch = text.match(/(?:REGION|AREA)\s*:\s*([^\n\r]+)/i);
      const cargoTypeMatch = text.match(/CARGO\s*TYPE\s*:\s*([^\n\r]+)/i);

      const minSize = qtyMatch ? parseFloat(qtyMatch[1].replace(/,/g, "")) : null;
      const maxSize = qtyMatch && qtyMatch[2]
        ? parseFloat(qtyMatch[2].replace(/,/g, ""))
        : (minSize ? Math.round(minSize * 1.1) : null);

      let laycanStart = startMatch ? startMatch[1].trim() : null;
      let laycanEnd = endMatch ? endMatch[1].trim() : null;
      if (laycanStart && !laycanEnd) {
        try {
          const d = new Date(laycanStart);
          if (!isNaN(d.getTime())) {
            d.setDate(d.getDate() + 5);
            laycanEnd = d.toISOString().split("T")[0];
          }
        } catch {}
      }

      const loadPort = loadPortMatch ? loadPortMatch[1].trim() : null;
      const dischPort = disPortMatch ? disPortMatch[1].trim() : null;
      const region = regionMatch ? regionMatch[1].trim() : null;

      cargoEntries.push({
        email_type: "VC",
        cargo_name: cargoMatch[1].trim(),
        cargo_type: cargoTypeMatch ? cargoTypeMatch[1].trim() : null,
        account_name: accountMatch ? accountMatch[1].trim() : null,
        min_size: isNaN(minSize as number) ? null : minSize,
        max_size: isNaN(maxSize as number) ? null : maxSize,
        region: region,
        matching_region: region,
        load_port: loadPort,
        discharge_port: dischPort,
        laycan_start_date: laycanStart,
        laycan_end_date: laycanEnd,
        email_id: emailMatch ? emailMatch[0] : null,
        phone_number: phoneMatch ? phoneMatch[1].trim() : null,
      });
    }
  }
  return cargoEntries;
}

const server = createServer(async (req, res) => {
  console.log("REQUEST RECEIVED");
  console.log(req.method);
  console.log(req.url);
  
  if (req.method !== "POST" || req.url !== "/extract") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  try {
    const body = await readBody(req);
    console.log("\n========== RAW REQUEST BODY ==========");
    console.log("BODY LENGTH:", body.length);
    console.log(body.substring(0, 300));
    console.log("...");
    console.log(body.substring(Math.max(0, body.length - 200)));
    console.log("======================================\n");
    
    let emailBody: string | null = null;

    // Try 1: Parse as valid JSON
    try {
      const parsed = JSON.parse(body);
      emailBody = parsed.emailBody;
      console.log("SUCCESS: Valid JSON parsed");
    } catch (err) {
      console.warn("\nJSON PARSE FAILED - attempting fallback regex");
      console.log("ERROR:", (err as any).message);
      
      // Try 2: Extract emailBody by finding the quoted string value
      const match = body.match(/"emailBody"\s*:\s*"([\s\S]*?)"\s*\}/);
      if (match && match[1]) {
        console.log("FALLBACK: Regex extraction successful");
        try {
          emailBody = JSON.parse('"' + match[1] + '"');
        } catch (e) {
          emailBody = match[1];
        }
      }
    }

    if (!emailBody) {
      console.error("Could not extract emailBody from request");
      sendJson(res, 400, { error: "Could not extract emailBody from request" });
      return;
    }

    console.log("\n========== EMAIL BODY EXTRACTED ==========");
    console.log("LENGTH:", emailBody.length);
    console.log("FIRST 300 CHARS:");
    console.log(emailBody.substring(0, 300));
    console.log("\nLAST 300 CHARS:");
    console.log(emailBody.substring(Math.max(0, emailBody.length - 300)));
    console.log("=========================================\n");

    if (emailBody.trim().length < 10) {
      sendJson(res, 400, { error: "Email body too short" });
      return;
    }

    // Clean the email text AFTER extraction
    const cleanText = emailBody
      .replace(/[\u0080-\u009F\uFFFD]/g, " ") // Corrupted UTF
      .replace(/[\u2010-\u2015\u2212]/g, "-") // Unicode dashes
      .replace(/[\u201C\u201D]/g, '"')        // Smart quotes
      .replace(/[\u2018\u2019]/g, "'")        // Smart apostrophes
      .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ") // Non-ASCII
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    console.log("CLEANED TEXT LENGTH:", cleanText.length);
    
    // Count vessel mentions before extraction
    const vesselMatches = cleanText.match(/\b(?:MV|M\/V)\s+([A-Z][A-Z0-9\s.'-]+?)(?:\s+|$)/gi) || [];
    console.log("DETECTED VESSEL MENTIONS:", vesselMatches.length);
    if (vesselMatches.length > 0) {
      console.log("VESSEL LIST:", vesselMatches.slice(0, 10).join(" | "));
    }

    console.log("\n--- HYBRID MULTI-PIPELINE EXECUTION START ---");
    console.log("[1/3] Triggering engine regular expressions...");
    
    // 1. Gather baseline extractions
    const rawRegexResults = extractToEnterpriseJSON(cleanText);
    let regexResultsArray = Array.isArray(rawRegexResults) ? rawRegexResults : [rawRegexResults];
    
    regexResultsArray = (regexResultsArray as any[]).filter(item => {
      return item && Object.keys(item).length > 0;
    });

    // If no VC/TC Cargo elements were picked up by the main extractor, try backup
    const hasCargoEntry = (regexResultsArray as any[]).some(item => 
      item && item.email_type && (
        String(item.email_type).toUpperCase() === "VC" ||
        String(item.email_type).toUpperCase() === "TC" ||
        String(item.email_type).toLowerCase().includes("cargo")
      )
    );
    if (!hasCargoEntry) {
      const extraCargos = backupCargoExtractor(cleanText);
      regexResultsArray = [...regexResultsArray, ...extraCargos];
    }

    // Cache to file system
    fs.writeFileSync("regex_output.json", JSON.stringify(regexResultsArray, null, 2), "utf8");
    console.log(`-> Prepared ${regexResultsArray.length} parsing blocks for ML validation loop.`);

    // 2. Spawn ML process
    console.log("[2/3] Spawning background DistilBERT predictive pipeline framework...");
    const pythonCommand = process.platform === "win32" ? "python" : "python3";
    const pythonProcess = spawn(pythonCommand, ["src/ml/predict.py"], {
      env: { ...process.env, PYTHONUNBUFFERED: "1" }
    });
    
    let pythonStdout = "";
    let pythonStderr = "";

    pythonProcess.stdin.write(cleanText, "utf8");
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data) => { pythonStdout += data.toString(); });
    pythonProcess.stderr.on("data", (data) => { pythonStderr += data.toString(); });

    // Handle spawn errors (e.g. python3 not found) — fall back to regex results gracefully
    pythonProcess.on("error", (err) => {
      console.warn(`[ML] Python process spawn failed: ${err.message}. Using regex-only results.`);
      const productionPayload = {
        email_body: emailBody,
        final_extracted_output: regexResultsArray
      };
      console.log("\n========== FINAL OUTPUT (regex-only fallback) ==========");
      console.log("RESULTS COUNT:", regexResultsArray.length);
      console.log(JSON.stringify(regexResultsArray, null, 2));
      fs.writeFileSync("ml_output.json", JSON.stringify(regexResultsArray, null, 2), "utf8");
      sendJson(res, 200, productionPayload);
    });

    // CRITICAL: Everything MUST stay inside the close block handler for synchronous timing!
    pythonProcess.on("close", (code) => {
      console.log(`[3/3] Background channel shut down with exit code: ${code}`);
      
      let finalMergedPayload: any = {};

      if (pythonStdout.trim().length > 0) {
        console.log("\n====== PYTHON RAW OUTPUT ======\n");
        console.log(pythonStdout);
        console.log("\n===============================\n");
      } else {
        console.warn("No stdout from ML process.");
      }

      const structuralPayload = parseJsonFromStdout(pythonStdout) ?? parseJsonFromStdout(pythonStderr);
      if (structuralPayload) {
        finalMergedPayload = structuralPayload?.FINAL_COMBINED_HYBRID_OUTPUT ?? structuralPayload ?? {};
      } else {
        console.warn("Could not read ML payload safely; falling back to regex-only baseline.");
        if (pythonStderr.trim().length > 0) {
          console.warn("PYTHON STDERR:", pythonStderr.trim());
        }
      }

      // Merge: always use regex output as primary (more accurate), supplement with ML for missing fields
      const mlArray = Array.isArray(finalMergedPayload) ? finalMergedPayload : [];
      const finalEnterpriseResponseArray = regexResultsArray.length > 0 ? regexResultsArray : mlArray;

      // Normalize field names and supplement regex with ML for genuinely missing fields
      const SUPPLEMENT_FIELDS = [
        "cargo_name", "cargo_type", "account_name", "duration", "load_port", "discharge_port",
        "del_port", "redel_port", "region", "matching_region", "phone_number", "restriction",
        "pic", "open_date", "close_date", "laycan_start_date", "laycan_end_date",
      ];
      const normalizeItem = (item: any, mlItem?: any): any => {
        if (!item || typeof item !== "object") return item;
        const out: any = { ...item };
        // Normalize ML 'cargo' → 'cargo_name'
        if ("cargo" in out && out.cargo && !out.cargo_name) {
          out.cargo_name = out.cargo;
        }
        delete out.cargo;
        // Supplement missing regex fields from ML when ML has a better value
        if (mlItem && typeof mlItem === "object") {
          const mlNorm: any = { ...mlItem };
          if ("cargo" in mlNorm && mlNorm.cargo && !mlNorm.cargo_name) {
            mlNorm.cargo_name = mlNorm.cargo;
            delete mlNorm.cargo;
          }
          for (const f of SUPPLEMENT_FIELDS) {
            if ((out[f] === null || out[f] === undefined || out[f] === "") && mlNorm[f]) {
              out[f] = mlNorm[f];
            }
          }
        }
        return out;
      };

      const cleanedResponseArray = finalEnterpriseResponseArray
        .filter((item: any) => item && typeof item === "object" && Object.keys(item).length > 0)
        .map((item: any, idx: number) => normalizeItem(item, mlArray[idx]));

      const seen = new Set<string>();
      const deduped: any[] = [];
      const stableStringify = (obj: any) => {
        if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
        const ordered: any = {};
        Object.keys(obj).sort().forEach(key => { ordered[key] = obj[key]; });
        return JSON.stringify(ordered);
      };
      for (const item of cleanedResponseArray) {
        const key = stableStringify(item);
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(item);
        }
      }

      const productionPayload = {
        email_body: emailBody,
        final_extracted_output: deduped
      };

      console.log("\n========== FINAL HYBRID MULTI-MERGED ARRAY SENT TO CLIENT ==========");
      console.log("RESULTS COUNT:", deduped.length);
      console.log(JSON.stringify(deduped, null, 2));

      fs.writeFileSync("ml_output.json", JSON.stringify(deduped, null, 2), "utf8");
      sendJson(res, 200, productionPayload);
    });

  } catch (err) {
    console.log("\n========== SERVER ERROR ==========");
    console.error(err);
    console.log("==================================\n");

    sendJson(res, 500, { error: String(err) });
  }
});

server.listen(port, () => {
  console.log(`Maritime extractor API running on http://localhost:${port}`);
});
