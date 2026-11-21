import type { VercelRequest, VercelResponse } from "@vercel/node";

const BACKEND = "https://syncpass.duckdns.org";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathSegments = (req.query.path as string[] | undefined) ?? [];
  const path = pathSegments.join("/");
  const query = req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const url = `${BACKEND}/api/${path}${query}`;

  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (v && !["host", "connection", "content-length", "transfer-encoding"].includes(k.toLowerCase())) {
      headers[k] = Array.isArray(v) ? v.join(", ") : v;
    }
  }

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method && !["GET", "HEAD"].includes(req.method)) {
    const raw = await readRawBody(req);
    if (raw.length > 0) {
      init.body = raw;
      if (!headers["content-type"]) {
        headers["content-type"] = "application/json";
      }
    }
  }

  try {
    const upstream = await fetch(url, init);
    const text = await upstream.text();
    res.status(upstream.status);
    upstream.headers.forEach((v, k) => {
      if (!["transfer-encoding", "content-encoding", "connection"].includes(k.toLowerCase())) {
        res.setHeader(k, v);
      }
    });
    res.send(text);
  } catch (err) {
    res.status(502).json({ error: "No se pudo contactar al backend." });
  }
}
