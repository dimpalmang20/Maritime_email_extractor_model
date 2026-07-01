"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMLModel = runMLModel;
const child_process_1 = require("child_process");
const PYTHON_CMD = process.platform === "win32" ? "python" : "python3";
function runMLModel(emailText) {
    const result = (0, child_process_1.spawnSync)(PYTHON_CMD, ["src/ml/client.py"], {
        input: emailText,
        encoding: "utf8",
        cwd: process.cwd(),
        env: { ...process.env, PYTHONUNBUFFERED: "1" },
        timeout: 120000,
        stdio: ["pipe", "pipe", "pipe"]
    });
    if (result.error) {
        console.error("ML client spawn error:", result.error.message);
        return {};
    }
    const raw = result.stdout ? result.stdout.trim() : "";
    if (!raw) {
        if (result.stderr) console.error("ML client stderr:", result.stderr.trim());
        return {};
    }
    try {
        return JSON.parse(raw);
    }
    catch (parseError) {
        console.error("ML client JSON parse error:", parseError);
        return {};
    }
}
