import { spawnSync } from "child_process";

function findJsonSubstring(text: string) {
  if (!text) return null;
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

function parseJsonPayload(raw: string) {
  if (!raw) return null;
  const sanitized = raw.replace(/\x1b\[[0-9;]*m/g, "").trim();
  if (!sanitized) return null;

  try {
    return JSON.parse(sanitized);
  } catch {
    const candidate = findJsonSubstring(sanitized);
    if (!candidate) return null;
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }
}

const PYTHON_CMD = process.platform === "win32" ? "python" : "python3";

export function runMLModel(
  emailText: string
) {
  const result = spawnSync(
    PYTHON_CMD,
    ["src/ml/client.py"],
    {
      input: emailText,
      encoding: "utf8",
      cwd: process.cwd(),
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
      timeout: 120000,
      stdio: ["pipe", "pipe", "pipe"]
    }
  );

  if (result.error) {
    console.error("ML Error:", result.error.message);
    return {};
  }

  const payload = parseJsonPayload(result.stdout) ?? parseJsonPayload(result.stderr);
  if (!payload) {
    console.error("ML JSON parse failed");
    return {};
  }

  return payload;
}
