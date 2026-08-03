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

// Client sends a task name, never a model id. Each task pins its own model, ceiling
// and thinking budget. `units` is the worst-case cost in 1024-token blocks.
//
// thinkingBudget matters a lot here: on gemini-2.5-flash, thinking tokens are billed
// against maxOutputTokens. The interview task originally had a 1024 ceiling and was
// spending ~979 of it on thinking, leaving a truncated fragment that failed to parse —
// so the interview silently never appeared. Tasks that emit fixed-shape JSON get no
// thinking; the two that benefit from reasoning get a bounded amount.
const TASKS: Record<string, {
  model: string;
  maxOutputTokens: number;
  thinkingBudget: number;
  units: number;
}> = {
  interview: { model: "gemini-2.5-flash", maxOutputTokens: 2048, thinkingBudget: 0, units: 2 },
  generate: { model: "gemini-2.5-flash", maxOutputTokens: 2048, thinkingBudget: 0, units: 2 },
  prompt: { model: "gemini-2.5-flash", maxOutputTokens: 1024, thinkingBudget: 0, units: 1 },
  diagnose: { model: "gemini-2.5-flash", maxOutputTokens: 4096, thinkingBudget: 1024, units: 4 },
  improve: { model: "gemini-2.5-flash", maxOutputTokens: 16384, thinkingBudget: 2048, units: 16 },
};
const DEFAULT_TASK = "generate";

const MAX_BODY_BYTES = 64 * 1024;

// Origin headers are forgeable, so they alone cannot protect an unauthenticated
// endpoint that spends money. A daily quota is what actually bounds the bill.
// Limits live in gemini_consume_quota's defaults (see the migration) so they can
// be tuned in SQL without redeploying this function.
async function consumeQuota(clientKey: string, units: number): Promise<boolean> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  // Fail closed: if the guard is misconfigured we must not become an open faucet.
  if (!url || !key) {
    console.error("quota guard not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
    return false;
  }
  try {
    const r = await fetch(`${url}/rest/v1/rpc/gemini_consume_quota`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({ p_client: clientKey, p_units: units }),
    });
    if (!r.ok) {
      console.error("quota rpc failed", r.status, (await r.text()).slice(0, 300));
      return false;
    }
    return (await r.json()) === true;
  } catch (e) {
    console.error("quota rpc error", e);
    return false;
  }
}

function clientKeyFrom(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const ip = fwd.split(",")[0].trim();
  return ip ? `ip:${ip}` : "ip:unknown";
}

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

  // A missing Origin used to pass, which meant curl and any script skipped the check
  // entirely — the whitelist only ever stopped cross-site calls from real browsers.
  // Browsers always send Origin on a cross-origin POST, so requiring it costs nothing
  // for legitimate traffic.
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
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

    // Charged before the upstream call — a request that is refused here costs nothing.
    const allowed = await consumeQuota(clientKeyFrom(req), task.units);
    if (!allowed) {
      return json({ error: "QUOTA_EXCEEDED" }, 429, cors);
    }

    // Temperature is the only generation knob the client may influence, and only within range.
    const rawTemp = (body.generationConfig as { temperature?: unknown } | undefined)?.temperature;
    const temperature = typeof rawTemp === "number" && rawTemp >= 0 && rawTemp <= 2 ? rawTemp : 0.7;

    const payload: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: task.maxOutputTokens,
        thinkingConfig: { thinkingBudget: task.thinkingBudget },
      },
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

    // Quota accounting charges each task's ceiling, which is the safe assumption but
    // tells us nothing about real consumption. Log the actual counts so the limits can
    // be retuned from measurement instead of guesswork.
    try {
      const usage = JSON.parse(responseText)?.usageMetadata;
      if (usage) {
        console.log(JSON.stringify({
          evt: "gemini_usage",
          task: taskName,
          in: usage.promptTokenCount ?? 0,
          out: usage.candidatesTokenCount ?? 0,
          think: usage.thoughtsTokenCount ?? 0,
          charged_units: task.units,
        }));
      }
    } catch { /* logging must never break the response */ }

    return new Response(responseText, {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("gemini-proxy failure", error);
    return json({ error: "Internal error" }, 500, cors);
  }
});
