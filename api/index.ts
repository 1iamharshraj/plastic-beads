import app from "../serverless/handler.js";

async function bufferRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function buildHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(nodeHeaders)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => headers.append(key, v));
    } else {
      headers.set(key, String(value));
    }
  }
  return headers;
}

export default async function handler(req, res) {
  try {
    const host = req.headers.host || "localhost";
    const url = new URL(req.url || "/", `https://${host}`);
    const method = req.method || "GET";

    let body = undefined;
    if (method !== "GET" && method !== "HEAD") {
      body = await bufferRequestBody(req);
    }

    const request = new Request(url, {
      method,
      headers: buildHeaders(req.headers),
      body,
    });

    const response = await app.fetch(request, {});

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      if (value !== undefined && value !== null) {
        res.setHeader(key, value);
      }
    });

    const responseBody = await response.arrayBuffer();
    res.end(Buffer.from(responseBody));
  } catch (err) {
    console.error("[vercel handler error]", err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}
