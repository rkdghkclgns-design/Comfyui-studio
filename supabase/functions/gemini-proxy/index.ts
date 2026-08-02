// Supabase Edge Function: gemini-proxy (joha-gallery / etasxbaorwgjoofdxean)
// Server-side Gemini proxy for ComfyUI Studio. The API key never reaches the browser.
//
// v3 — hardening pass. The client is UNTRUSTED: it may only supply prompt content.
// Everything that determines cost (model, token budget, image count) is fixed here.
//   - Model is chosen from a server-side whitelist; the client cannot escalate to a
//     pricier model or inject a path into the upstream URL.
//   - maxOutputTokens is clamped to a per-task ceiling.
//   - The Imagen (:predict) branch is removed — ComfyUI Studio never used it and it
//     was the single most expensive abusable surface.
//   - Requests are restricted to known origins.
//   - Request bodies are size-capped before any upstream call.

const ALLOWED_ORIGINS = new Set([
  "https://comfyui-studio.com",
  "https://www.comfyui-studio.com",
  "http://localhost:5173",
  "http://localhost:4173",
]);

// Client sends a task name, never a model id. Each task pins its own model and ceiling.
const TASKS: Record<string, { model: string; maxOutputTokens: number }> = {
  interview: { model: "gemini-2.5-flash", maxOutputTokens: 1024 },
  generate: { model: "gemini-2.5-flash", maxOutputTokens: 2048 },
  prompt: { model: "gemini-2.5-flash", maxOutputTokens: 1024 },
  diagnose: { model: "gemini-2.5-flash", maxOutputTokens: 4096 },
  improve: { model: "gemini-2.5-flash", maxOutputTokens: 16384 },
};
const DEFAULT_TASK = "generate";

const MAX_BODY_BYTES = 64 * 1024;

function corsFor(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://comfyui-studio.com";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

// Accept only { parts: [{ text }] } shaped content. Drops inlineData, fileData and any
// other field a caller might try to smuggle upstream.
function sanitizeContents(raw: unknown): Array<{ parts: Array<{ text: string }> }> | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 8) return null;
  const out: Array<{ parts: Array<{ text: string }> }> = [];
  for (const item of raw) {
    const parts = (item as { parts?: unknown })?.parts;
    if (!Array.isArray(parts) || parts.length === 0 || parts.length > 8) return null;
    const texts: Array<{ text: string }> = [];
    for (const p of parts) {
      const text = (p as { text?: unknown })?.text;
      if (typeof text !== "string") return null;
      texts.push({ text });
    }
    out.push({ parts: texts });
  }
  return out;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const cors = corsFor(origin);

  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);

  if (origin !== null && !ALLOWED_ORIGINS.has(origin)) {
    return json({ error: "Origin not allowed" }, 403, cors);
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("GOOGLE_API_KEY") ?? "";
    if (!apiKey) return json({ error: "GEMINI_API_KEY not configured" }, 500, cors);

    const rawBody = await req.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return json({ error: "Request too large" }, 413, cors);
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return json({ error: "Invalid JSON body" }, 400, cors);
    }

    const taskName = typeof body.task === "string" && body.task in TASKS ? body.task : DEFAULT_TASK;
    const task = TASKS[taskName];

    const contents = sanitizeContents(body.contents);
    if (!contents) {
      return json({ error: "Missing or invalid 'contents' field" }, 400, cors);
    }

    // Temperature is the only generation knob the client may influence, and only within range.
    const rawTemp = (body.generationConfig as { temperature?: unknown } | undefined)?.temperature;
    const temperature = typeof rawTemp === "number" && rawTemp >= 0 && rawTemp <= 2 ? rawTemp : 0.7;

    const payload: Record<string, unknown> = {
      contents,
      generationConfig: { temperature, maxOutputTokens: task.maxOutputTokens },
    };

    // systemInstruction is accepted as plain text only (same sanitizing as contents).
    const sysRaw = body.systemInstruction;
    if (sysRaw) {
      const sys = sanitizeContents([sysRaw]);
      if (!sys) return json({ error: "Invalid 'systemInstruction'" }, 400, cors);
      payload.systemInstruction = sys[0];
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${task.model}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(payload),
    });
    const responseText = await response.text();

    if (!response.ok) {
      // Upstream detail is logged server-side but not echoed to the browser.
      console.error("Gemini upstream error", response.status, responseText.slice(0, 500));
      return json({ error: `Gemini API error: ${response.status}` }, response.status, cors);
    }

    return new Response(responseText, {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("gemini-proxy failure", error);
    return json({ error: "Internal error" }, 500, cors);
  }
});
