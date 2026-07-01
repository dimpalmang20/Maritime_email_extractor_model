import fs from "fs";
import path from "path";
import { extractEmailWithBody } from "../dist/maritime-extractor.js";

// ── Configuration ────────────────────────────────────────────────────────────
const DATASET_DIR    = path.resolve("datasets/raw_emails");
const OUTPUT_FILE    = path.resolve("output", "all_extracted_results.json");
const SUMMARY_FILE   = path.resolve("output", "extraction_summary.json");
const OUTPUT_DIR     = path.resolve("output");
const SAVE_INTERVAL  = 50;

// Configurable concurrency: default 4 workers, capped at 8.
// Set WORKER_CONCURRENCY env var to override.
const CONCURRENCY = Math.min(
    parseInt(process.env.WORKER_CONCURRENCY || "4", 10),
    8
);
// ─────────────────────────────────────────────────────────────────────────────

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const files = fs.readdirSync(DATASET_DIR).filter(f => f.endsWith(".txt"));

let results = [];
let summary = {
    total_emails: 0,
    tonnage_emails: 0,
    cargo_vc_emails: 0,
    cargo_tc_emails: 0,
    failed_emails: 0
};

if (fs.existsSync(OUTPUT_FILE)) {
    console.log("Previous output found.");
    results = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
}
if (fs.existsSync(SUMMARY_FILE)) {
    summary = JSON.parse(fs.readFileSync(SUMMARY_FILE, "utf8"));
}

function saveProgress() {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), "utf8");
    fs.writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2), "utf8");
    console.log("");
    console.log("================================");
    console.log(`Saved ${summary.total_emails} emails`);
    console.log("================================");
}

const START_INDEX = results.length;
console.log(`Resuming from email ${START_INDEX + 1}`);
console.log(`Worker concurrency: ${CONCURRENCY}`);

const remainingFiles = files.slice(START_INDEX);

// ── Worker pool ───────────────────────────────────────────────────────────────
// Each "worker" is an async loop that picks the next available file and
// processes it. Workers run concurrently and share a single file-index counter,
// so no file is processed twice. After the daemon fix, spawnSync is fast
// (<200ms), so even sequential throughput far exceeds the old cold-start path.
// When Worker Threads support is added later, this pool structure maps directly.

let fileIndex = 0;
let completedCount = 0;

async function processFile(file, globalIndex) {
    return new Promise((resolve) => {
        try {
            console.log(`Processing (${globalIndex + 1}/${files.length}) ${file}`);
            const fullPath = path.join(DATASET_DIR, file);
            const emailText = fs.readFileSync(fullPath, "utf8");
            const extraction = extractEmailWithBody(emailText);
            resolve({ ok: true, extraction });
        } catch (err) {
            console.error(`Failed: ${file}`, err);
            resolve({ ok: false });
        }
    });
}

async function worker() {
    while (fileIndex < remainingFiles.length) {
        const localIndex = fileIndex++;
        const file = remainingFiles[localIndex];
        const globalIndex = START_INDEX + localIndex;

        const { ok, extraction } = await processFile(file, globalIndex);

        if (ok) {
            results.push(extraction);
            summary.total_emails++;

            const extracted = extraction.final_extracted_output || [];
            for (const item of extracted) {
                const type = (item.email_type || "").toLowerCase();
                if (type.includes("tonnage"))    summary.tonnage_emails++;
                else if (type.includes("vc"))    summary.cargo_vc_emails++;
                else if (type.includes("tc"))    summary.cargo_tc_emails++;
            }
        } else {
            summary.failed_emails++;
        }

        completedCount++;
        if (completedCount % SAVE_INTERVAL === 0) saveProgress();
    }
}
// ─────────────────────────────────────────────────────────────────────────────

// Launch CONCURRENCY workers and wait for all to finish
const workers = Array.from({ length: Math.min(CONCURRENCY, remainingFiles.length || 1) }, () => worker());
await Promise.all(workers);

saveProgress();

console.log("");
console.log("DONE");
console.log(`Output: ${OUTPUT_FILE}`);
console.log(`Summary: ${SUMMARY_FILE}`);
