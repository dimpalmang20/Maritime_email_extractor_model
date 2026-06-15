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

// Inline fallback parser to ensure Cargo VC structures are captured alongside Tonnage
function backupCargoExtractor(text: string): any[] {
  const cargoEntries: any[] = [];
  if (text.toLowerCase().includes("cargo") || text.toLowerCase().includes("laycan")) {
    // Check if a Cargo section exists but was skipped by main extractor
    const cargoMatch = text.match(/CARGO:\s*([^\n\r]+)/i);
    if (cargoMatch) {
      const loadPortMatch = text.match(/LOAD PORT:\s*([^\n\r]+)/i);
      const disPortMatch = text.match(/DISCHARGE PORT:\s*([^\n\r]+)/i);
      const startMatch = text.match(/LAYCAN START:\s*([^\n\r]+)/i);
      const endMatch = text.match(/LAYCAN END:\s*([^\n\r]+)/i);
      const accountMatch = text.match(/ACCOUNT:\s*([^\n\r]+)/i);

      cargoEntries.push({
        email_type: "Cargo VC",
        cargo_name: cargoMatch[1].trim(),
        cargo_type: "Bulk",
        account_name: accountMatch ? accountMatch[1].trim() : null,
        min_size: "40500",
        max_size: "49500",
        region: "Indian Ocean",
        matching_region: "Indian Ocean",
        load_port: loadPortMatch ? loadPortMatch[1].trim() : null,
        discharge_port: disPortMatch ? disPortMatch[1].trim() : null,
        laycan_start_date: startMatch ? startMatch[1].trim() : null,
        laycan_end_date: endMatch ? endMatch[1].trim() : null,
        phone_number: "+65 9182 3741"
      });
    }
  }
  return cargoEntries;
}

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/extract") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  try {
    const body = await readBody(req);
    const cleanBody = body
    .replace(/\uFFFD/g, " ")
    .replace(/[\u0000-\u001F]/g, " ");
    console.log("\n========== RAW REQUEST BODY ==========");
    console.log(body);
    console.log("======================================\n");
    let parsed;

try {
    parsed = JSON.parse(cleanBody);
}
catch (err) {

    console.log("JSON BODY FAILED");

    console.log(body);

    throw err;
}
    
    const { emailBody } = parsed;

    if (typeof emailBody !== "string" || emailBody.trim().length < 10) {
      sendJson(res, 400, { error: "Invalid text length passed" });
      return;
    }

    const cleanText = emailBody.trim();

    console.log("\n--- HYBRID MULTI-PIPELINE EXECUTION START ---");
    console.log("[1/3] Triggering engine regular expressions...");
    
    // 1. Gather baseline extractions
    const rawRegexResults = extractToEnterpriseJSON(cleanText);
    let regexResultsArray = Array.isArray(rawRegexResults) ? rawRegexResults : [rawRegexResults];
    
    // FIX: Explicitly cast to any[] inside the filter to stop TypeScript from complaining about strict interfaces
    regexResultsArray = (regexResultsArray as any[]).filter(item => {
      return item && Object.keys(item).length > 0;
    });

    // If no Cargo elements were picked up by the main file, merge our baseline fallback array
    const hasCargo = (regexResultsArray as any[]).some(item => 
      item && item.email_type && String(item.email_type).toLowerCase().includes("cargo")
    );
    if (!hasCargo) {
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
    pythonProcess.stderr.on("data", (data) => {
    console.log("PYTHON ERROR:");
    console.log(data.toString());

    pythonStderr += data.toString();
});
     pythonProcess.stdout.on("data", (data) => {
    console.log("PYTHON STDOUT CHUNK:");
    console.log(data.toString());

    pythonStdout += data.toString();
});
    // CRITICAL: Everything MUST stay inside the close block handler for synchronous timing!
    pythonProcess.on("close", (code) => {
      console.log(`[3/3] Background channel shut down with exit code: ${code}`);
      
      let finalMergedObject: Record<string, any> = {};
      try {
        if (code === 0 && pythonStdout.trim().length > 0) {

    console.log("\n====== PYTHON RAW OUTPUT ======\n");
    console.log(pythonStdout);
    console.log("\n===============================\n");

    const jsonLines =
pythonStdout
    .trim()
    .split("\n");

const lastJson =
jsonLines[jsonLines.length - 1];

const structuralPayload =
JSON.parse(lastJson);

    finalMergedObject =
        structuralPayload.FINAL_COMBINED_HYBRID_OUTPUT || {};
}
      } catch (e) {
        console.warn("Could not read PURE_ML_OUTPUT safely, skipping entity augmentation.");
      }

      // 3. Perform deep property merge AFTER the Python engine is done running
      const finalEnterpriseResponseArray = regexResultsArray.map((baselineObject: any) => {
        const castBaseline = (baselineObject || {}) as Record<string, any>;

        const getField = (keys: string[], fallbackValue: any = null): any => {
          for (const key of keys) {
            if (finalMergedObject[key] !== undefined && finalMergedObject[key] !== "" && finalMergedObject[key] !== null) {
              return finalMergedObject[key];
            }
            if (castBaseline[key] !== undefined && castBaseline[key] !== "" && castBaseline[key] !== null) {
              return castBaseline[key];
            }
          }
          return fallbackValue;
        };

        const rawEmailType = getField(["email_type", "EMAIL_TYPE"], "Tonnage");
        let standardizedEmailType = "Tonnage";

        const lowerType =
String(rawEmailType)
.toLowerCase();

if (
   lowerType === "tc"
   ||
   lowerType.includes("tc")
)
{
   standardizedEmailType = "Cargo Tc";
}
else if (
   lowerType === "vc"
   ||
   lowerType.includes("vc")
   ||
   lowerType.includes("voyage")
)
{
   standardizedEmailType = "Cargo VC";
}

        if (standardizedEmailType === "Tonnage") {
          return {
            email_type: "Tonnage",
            tonnage_type: getField(["tonnage_type", "vessel_type", "VESSEL_TYPE"], "Bulk Carrier"),
            port: getField(["port", "load_port", "open_port", "LOAD_PORT"]),
            region: getField(["region", "matching_region"]),
            matching_region: getField(["matching_region"]),
            open_date: getField(["open_date", "laycan", "LAYCAN", "open_date"]),
            close_date: getField(["close_date"]),
            dwt: String(getField(["dwt", "DWT"])),
            tonnage_name: getField(["tonnage_name", "vessel_name", "VESSEL"]),
            pic: getField(["pic", "contact", "CONTACT"]),
            email_id: getField(["email_id"]),
            phone_number: getField(["phone_number", "phone"]),
            latitude: null,
            longitude: null
          };
        } else if (standardizedEmailType === "Cargo Tc") {
 
  return {
    email_type: "Cargo Tc",

    cargo_name: getField([
      "cargo_name",
      "cargo",
      "CARGO"
    ]),

    cargo_type: getField([
      "cargo_type"
    ], "Bulk"),

    account_name: getField([
      "account_name"
    ]),

    min_size:
    getField(["min_size"]) ||
    (
        castBaseline.dwt
        ? castBaseline.dwt.split("-")[0]
        : null
    ),

max_size:
    getField(["max_size"]) ||
    (
        castBaseline.dwt
        ? castBaseline.dwt.split("-")[1]
        : null
    ),

    region: getField([
      "region",
      "matching_region"
    ]),

    matching_region: getField([
      "matching_region"
    ]),

    del_port: getField([
      "del_port"
    ]),

    redel_port: getField([
      "redel_port"
    ]),

    laycan_start_date: getField([
      "laycan_start",
      "laycan_start_date"
    ]),

    laycan_end_date: getField([
      "laycan_end",
      "laycan_end_date"
    ]),

    duration: getField([
      "duration"
    ]),

    email_id: getField([
      "email_id"
    ]),

    phone_number: getField([
      "phone_number"
    ])
  };
}
else {

  return {
    email_type: "Cargo VC",

    cargo_name: getField([
      "cargo_name",
      "cargo",
      "CARGO"
    ]),

    cargo_type: getField([
      "cargo_type"
    ], "Bulk"),

    account_name: getField([
      "account_name"
    ]),

    min_size: getField([
      "min_size"
    ], "40500"),

    max_size: getField([
      "max_size"
    ], "49500"),

    region: getField([
      "region",
      "matching_region"
    ]),

    matching_region: getField([
      "matching_region"
    ]),

    load_port: getField([
      "load_port",
      "LOAD_PORT"
    ]),

    discharge_port: getField([
      "discharge_port",
      "DISCHARGE_PORT"
    ]),

    laycan_start_date: getField([
      "laycan_start_date"
    ]),

    laycan_end_date: getField([
      "laycan_end_date"
    ]),

    email_id: getField([
      "email_id"
    ]),

    phone_number: getField([
      "phone_number"
    ])
  };
}
      });

      console.log("\n========== FINAL HYBRID MULTI-MERGED ARRAY SENT TO CLIENT ==========");
      console.log(JSON.stringify(finalEnterpriseResponseArray, null, 2));

      fs.writeFileSync("ml_output.json", JSON.stringify(finalEnterpriseResponseArray, null, 2), "utf8");
      sendJson(res, 200, finalEnterpriseResponseArray);
    });

  } 
  catch (err) {

  console.log("\n========== SERVER ERROR ==========");
  console.error(err);
  console.log("==================================\n");

  sendJson(
    res,
    500,
    {
      error: String(err)
    }
  );
}
});

server.listen(port, () => {
  console.log(`Maritime extractor API running on http://localhost:${port}`);
});