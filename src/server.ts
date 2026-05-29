import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extractToEnterpriseJSON } from "./maritime-extractor.js";

const port = 3000;

function sendJson(
  res: ServerResponse,
  statusCode: number,
  payload: unknown,
) {
  res.writeHead(statusCode, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = "";

    req.on("data", (chunk: Buffer) => {
      body += chunk.toString("utf8");
      if (body.length > 2_000_000) {
        req.destroy(new Error("Request body too large"));
      }
    });

    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  if (req.method !== "POST" || req.url !== "/extract") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  try {
    const body = await readBody(req);
    const parsed = JSON.parse(body) as { emailBody?: unknown };
    const { emailBody } = parsed;

    if (typeof emailBody !== "string" || emailBody.trim().length < 10) {
      sendJson(res, 400, {
        error: "emailBody is required and must be at least 10 characters",
      });
      return;
    }

    const entries = extractToEnterpriseJSON(emailBody.trim());
    sendJson(res, 200, entries);
  } catch {
    sendJson(res, 400, { error: "Invalid JSON request body" });
  }
});

server.listen(port, () => {
  console.log(`Maritime extractor API running on http://localhost:${port}`);
});
