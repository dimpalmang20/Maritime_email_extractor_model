/**
 * Benchmark script for maritime email extraction accuracy verification.
 *
 * Usage:
 *   node scripts/benchmark.mjs baseline    — run extractor, save baseline JSON
 *   node scripts/benchmark.mjs compare     — run extractor, compare vs baseline
 *
 * Requires: node dist/server.js must be running (for ML daemon to be alive).
 * If ML daemon is not running, extraction still works (regex-only mode).
 */

import fs from "fs";
import path from "path";
import { extractToEnterpriseJSON } from "../dist/maritime-extractor.js";

const BASELINE_FILE = path.resolve("output", "benchmark_baseline.json");
const OUTPUT_DIR = path.resolve("output");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Collect sample emails from known locations
function collectEmails() {
    const emails = [];

    const candidates = [
        path.resolve("scripts", "test_email.txt"),
        path.resolve("src", "sample-email.txt"),
    ];

    // Also scan datasets/raw_emails if present
    const datasetDir = path.resolve("datasets", "raw_emails");
    if (fs.existsSync(datasetDir)) {
        const datasetFiles = fs.readdirSync(datasetDir)
            .filter(f => f.endsWith(".txt"))
            .slice(0, 100)
            .map(f => path.join(datasetDir, f));
        candidates.push(...datasetFiles);
    }

    for (const p of candidates) {
        if (fs.existsSync(p)) {
            emails.push({ path: p, text: fs.readFileSync(p, "utf8") });
        }
    }

    if (emails.length === 0) {
        console.error("No email files found. Add .txt files to datasets/raw_emails/");
        process.exit(1);
    }

    return emails;
}

function runExtraction(emails) {
    const results = [];
    for (const { path: emailPath, text } of emails) {
        const t0 = Date.now();
        let output = null;
        let error = null;
        try {
            output = extractToEnterpriseJSON(text);
        } catch (err) {
            error = String(err);
        }
        const ms = Date.now() - t0;
        results.push({ path: emailPath, output, error, ms });
        console.log(`  [${ms}ms] ${path.basename(emailPath)}`);
    }
    return results;
}

function compareResults(baseline, current) {
    let totalFields = 0;
    let changedFields = 0;
    const diffs = [];

    for (let i = 0; i < Math.min(baseline.length, current.length); i++) {
        const bItem = baseline[i];
        const cItem = current[i];
        const emailName = path.basename(bItem.path);

        if (JSON.stringify(bItem.output) === JSON.stringify(cItem.output)) continue;

        // Deep compare field by field
        const bEntries = bItem.output || [];
        const cEntries = cItem.output || [];

        const maxLen = Math.max(bEntries.length, cEntries.length);
        for (let j = 0; j < maxLen; j++) {
            const bEntry = bEntries[j] || {};
            const cEntry = cEntries[j] || {};
            const allKeys = new Set([...Object.keys(bEntry), ...Object.keys(cEntry)]);
            for (const key of allKeys) {
                totalFields++;
                if (JSON.stringify(bEntry[key]) !== JSON.stringify(cEntry[key])) {
                    changedFields++;
                    diffs.push({
                        email: emailName,
                        entry: j,
                        field: key,
                        baseline: bEntry[key],
                        current: cEntry[key]
                    });
                }
            }
        }
    }

    return { totalFields, changedFields, diffs };
}

const mode = process.argv[2] || "baseline";
const emails = collectEmails();
console.log(`\nFound ${emails.length} email(s) for benchmarking.\n`);
console.log("Running extraction...");

const t0Total = Date.now();
const results = runExtraction(emails);
const totalMs = Date.now() - t0Total;

const avgMs = Math.round(totalMs / emails.length);
console.log(`\nTotal: ${totalMs}ms | Average: ${avgMs}ms/email | Emails: ${emails.length}`);

if (mode === "baseline") {
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(results, null, 2), "utf8");
    console.log(`\nBaseline saved to: ${BASELINE_FILE}`);
    console.log("Run with 'compare' after optimizations to verify accuracy.");
} else if (mode === "compare") {
    if (!fs.existsSync(BASELINE_FILE)) {
        console.error("No baseline found. Run with 'baseline' first.");
        process.exit(1);
    }
    const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, "utf8"));
    const { totalFields, changedFields, diffs } = compareResults(baseline, results);

    console.log(`\n=== ACCURACY COMPARISON ===`);
    console.log(`Total fields compared: ${totalFields}`);
    console.log(`Changed fields: ${changedFields}`);

    if (changedFields === 0) {
        console.log("\nRESULT: PASS — All extracted fields are identical.");
    } else {
        console.log(`\nRESULT: FAIL — ${changedFields} field(s) changed:`);
        for (const d of diffs.slice(0, 20)) {
            console.log(`  Email: ${d.email} | Entry[${d.entry}].${d.field}`);
            console.log(`    Baseline: ${JSON.stringify(d.baseline)}`);
            console.log(`    Current:  ${JSON.stringify(d.current)}`);
        }
        process.exit(1);
    }
} else {
    console.error(`Unknown mode '${mode}'. Use 'baseline' or 'compare'.`);
    process.exit(1);
}
