// 워크플로우 엔진 — 그래프 생성/변환/검증에 필요한 순수 함수만 모은다.
// App.jsx에서 분리: React 상태나 DOM에 의존하지 않으므로 단독으로 테스트할 수 있고,
// UI 변경이 그래프 생성 로직의 diff를 가리지 않는다.
//
// CATS는 아이콘·라벨 등 표시용 정보를 함께 들고 있어 UI 쪽(App.jsx)에 남겼다.
// sanitizeAIConfig는 카테고리 id 목록을 인자로 받는다.

// ═══════════════════════════════════════════
// WORKFLOW URL SHARING (Feature 5)
// ═══════════════════════════════════════════
// The workflow travels inside the URL itself. A previous version stored it in
// localStorage and handed out an id, which meant the link never resolved on the
// recipient's machine — the share silently did nothing.
// The hash never reaches a server, so proxy URL limits are irrelevant here. The real
// ceiling is what chat apps and mail clients will carry without truncating the link —
// a 30k-character URL "works" locally and then silently arrives broken.
export const SHARE_URL_MAX = 8000;

export function encodeWorkflow(wf) {
  const bytes = new TextEncoder().encode(JSON.stringify(wf));
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeWorkflow(encoded) {
  const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}

// Returns a shareable URL, or null when the workflow is too large to fit in one.
export function buildShareUrl(wf) {
  try {
    const url = window.location.origin + window.location.pathname + "#wf=" + encodeWorkflow(wf);
    return url.length <= SHARE_URL_MAX ? url : null;
  } catch { return null; }
}

// A shared link is attacker-controllable input. Without this check any decodable
// value (`#wf=eyJhIjoxfQ` is ten characters) reached the renderer, where
// `workflow.nodes.length` threw and unmounted the whole app — and because the hash
// survives reloads, the page stayed blank until the URL was edited by hand.
export function isWorkflowShaped(wf) {
  return Boolean(wf) && typeof wf === "object" && Array.isArray(wf.nodes) && Array.isArray(wf.links);
}

export function loadSharedWorkflow() {
  try {
    const hash = window.location.hash || "";
    const m = hash.match(/[#&]wf=([^&]+)/);
    if (!m) return null;
    const wf = decodeWorkflow(m[1]);
    return isWorkflowShaped(wf) ? wf : null;
  } catch { return null; }
}

// Generate a random valid seed
export function randomSeed() { return Math.floor(Math.random() * 2147483647); }

// ═══════════════════════════════════════════
// WORKFLOW PATCH APPLICATION
// The improver asks the model for a *patch* rather than the whole workflow.
// Returning a full workflow meant the output had to restate every node, which
// blew the token ceiling on any real-sized graph and produced truncated JSON.
// ═══════════════════════════════════════════
export function applyWorkflowPatch(original, patch) {
  const wf = JSON.parse(JSON.stringify(original));
  wf.nodes = Array.isArray(wf.nodes) ? wf.nodes : [];
  wf.links = Array.isArray(wf.links) ? wf.links : [];

  const removed = new Set((patch.remove || []).map(Number).filter(Number.isFinite));
  if (removed.size) {
    wf.nodes = wf.nodes.filter(n => !removed.has(Number(n.id)));
    wf.links = wf.links.filter(l => !removed.has(Number(l[1])) && !removed.has(Number(l[3])));
  }

  for (const mod of patch.modify || []) {
    const target = wf.nodes.find(n => Number(n.id) === Number(mod.id));
    if (!target) continue;
    if (Array.isArray(mod.widgets_values)) target.widgets_values = mod.widgets_values;
    if (typeof mod.title === "string") target.title = mod.title;
    if (typeof mod.type === "string") target.type = mod.type;
  }

  // The model is told to use ids above the current max, but nothing enforces it.
  // A duplicate id makes ComfyUI reject the whole graph, so drop collisions.
  const existingIds = new Set(wf.nodes.map(n => Number(n.id)));
  for (const node of patch.add || []) {
    if (!node || node.id == null || !node.type) continue;
    if (existingIds.has(Number(node.id))) continue;
    existingIds.add(Number(node.id));
    wf.nodes.push(node);
  }

  const removeLinkIds = new Set((patch.links_remove || []).map(Number).filter(Number.isFinite));
  if (removeLinkIds.size) wf.links = wf.links.filter(l => !removeLinkIds.has(Number(l[0])));

  // ComfyUI links are 6-element tuples [id, from, fromSlot, to, toSlot, TYPE].
  // A 5-element link imports as a typeless edge and breaks the graph, and an edge
  // pointing at a node the patch just removed dangles.
  for (const link of patch.links_add || []) {
    if (!Array.isArray(link) || link.length < 6) continue;
    if (!existingIds.has(Number(link[1])) || !existingIds.has(Number(link[3]))) continue;
    wf.links.push(link);
  }

  const maxNodeId = wf.nodes.reduce((m, n) => Math.max(m, Number(n.id) || 0), 0);
  const maxLinkId = wf.links.reduce((m, l) => Math.max(m, Number(l[0]) || 0), 0);
  wf.last_node_id = maxNodeId;
  wf.last_link_id = maxLinkId;
  return wf;
}

// The model's output is untrusted: an out-of-range or misspelled value silently
// produces a workflow ComfyUI rejects, which users blame on this tool. Clamp it.
export const clampInt = (v, lo, hi, fallback) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
};
export const clampNum = (v, lo, hi, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
};
export const pickFrom = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback);

export function sanitizeAIConfig(parsed, base, categories) {
  const dim = v => clampInt(Math.round(clampInt(v, 256, 2048, 1024) / 8) * 8, 256, 2048, 1024);

  const category = pickFrom(parsed.category, categories, base.category || "t2i");
  let modelBase = pickFrom(parsed.modelBase, ["SD15", "SDXL", "Flux", "Wan", "Hunyuan"], base.modelBase);
  let cfg = clampNum(parsed.cfg, 1, 15, base.cfg);

  // Per-field clamping cannot catch an invalid *combination*. The model happily
  // returns pairs the generator cannot build, e.g. t2v with SDXL, or Flux with a
  // normal cfg (Flux is guidance-distilled and needs cfg 1.0).
  const isVideo = category === "t2v" || category === "i2v";
  if (isVideo && !["Wan", "Hunyuan"].includes(modelBase)) modelBase = "Wan";
  if (!isVideo && ["Wan", "Hunyuan"].includes(modelBase)) modelBase = "SDXL";
  if (modelBase === "Flux") cfg = clampNum(parsed.cfg, 1, 10, 3.5); // fed to FluxGuidance

  return {
    category,
    modelBase,
    cfg,
    sampler: pickFrom(parsed.sampler, SAMPLERS, base.sampler),
    scheduler: pickFrom(parsed.scheduler, SCHEDULERS, base.scheduler),
    steps: clampInt(parsed.steps, 1, 60, base.steps),
    width: dim(parsed.width),
    height: dim(parsed.height),
    prompt: typeof parsed.prompt === "string" ? parsed.prompt.slice(0, 2000) : base.prompt,
    negPrompt: typeof parsed.negPrompt === "string" ? parsed.negPrompt.slice(0, 2000) : base.negPrompt,
  };
}

// Kept in sync with ComfyUI's KSampler sampler_name list. The AI picks from this
// set; anything outside it was previously discarded in silence, so a valid choice
// like "dpmpp_2m_sde_gpu" would quietly revert to the default.
export const SAMPLERS = [
  "euler", "euler_ancestral", "heun", "dpm_2", "dpm_2_ancestral", "lms",
  "dpmpp_2s_ancestral", "dpmpp_sde", "dpmpp_sde_gpu",
  "dpmpp_2m", "dpmpp_2m_sde", "dpmpp_2m_sde_gpu",
  "dpmpp_3m_sde", "dpmpp_3m_sde_gpu",
  "ddpm", "lcm", "uni_pc", "uni_pc_bh2", "ddim",
];
export const SCHEDULERS = ["normal", "karras", "exponential", "sgm_uniform", "simple", "ddim_uniform", "beta"];

// ═══════════════════════════════════════════
// WORKFLOW GENERATOR - ALL 9 CATEGORIES (#1)
// ═══════════════════════════════════════════
export function genWF(c) {
  const { category: cat, model, sampler, scheduler, steps, cfg, width, height, seed, prompt, negPrompt, modelBase } = c;
  let ns = [], ls = [], lid = 1, nid = 1;
  const N = (type, title, pos, wv, ins = [], outs = []) => {
    const id = nid++;
    ns.push({ id, type, title, pos, size: [320, 160], flags: {}, order: id - 1, mode: 0, inputs: ins, outputs: outs, properties: { "Node name for S&R": type }, widgets_values: wv });
    return id;
  };
  const L = (si, ss, di, ds, tp) => { const id = lid++; ls.push([id, si, ss, di, ds, tp]); return id; };
  const mkOut = (name, type, slot = 0) => ({ name, type, links: [], slot_index: slot });
  const mkIn = (name, type) => ({ name, type, link: null });
  const s = (seed && seed > 0) ? seed : randomSeed();
  const isV = ["t2v", "i2v"].includes(cat);
  // Flux ships as a bare diffusion model, so it needs the same split loader trio as
  // video rather than a single checkpoint. Without this the generator produced a
  // CheckpointLoaderSimple graph that cannot load Flux at all, while the spec panel
  // told the user to prepare 14GB of VRAM for it.
  const isFlux = !isV && modelBase === "Flux";

  // === Model / CLIP / VAE loaders ===
  let ckId, clipSrc, clipSlot, modSrc, modSlot, vaeId = null;
  if (isV) {
    ckId = N("UNETLoader", "Load Diffusion Model", [50, 100], [model || "YOUR_MODEL.safetensors", "default"], [], [mkOut("MODEL", "MODEL")]);
    const clipId = N("DualCLIPLoader", "Load CLIP", [50, 320], ["clip_l.safetensors", "umt5_xxl_fp8.safetensors", "wan"], [], [mkOut("CLIP", "CLIP")]);
    vaeId = N("VAELoader", "Load VAE", [50, 520], ["wan_2.1_vae.safetensors"], [], [mkOut("VAE", "VAE")]);
    clipSrc = clipId; clipSlot = 0; modSrc = ckId; modSlot = 0;
  } else if (isFlux) {
    ckId = N("UNETLoader", "Load Diffusion Model", [50, 100], [model || "flux1-dev.safetensors", "fp8_e4m3fn"], [], [mkOut("MODEL", "MODEL")]);
    const clipId = N("DualCLIPLoader", "Load CLIP", [50, 320], ["t5xxl_fp16.safetensors", "clip_l.safetensors", "flux"], [], [mkOut("CLIP", "CLIP")]);
    vaeId = N("VAELoader", "Load VAE", [50, 520], ["ae.safetensors"], [], [mkOut("VAE", "VAE")]);
    clipSrc = clipId; clipSlot = 0; modSrc = ckId; modSlot = 0;
  } else {
    ckId = N("CheckpointLoaderSimple", "Load Checkpoint", [50, 100], [model || "YOUR_MODEL.safetensors"], [], [
      { name: "MODEL", type: "MODEL", links: [], slot_index: 0 },
      { name: "CLIP", type: "CLIP", links: [], slot_index: 1 },
      { name: "VAE", type: "VAE", links: [], slot_index: 2 },
    ]);
    clipSrc = ckId; clipSlot = 1; modSrc = ckId; modSlot = 0;
  }
  // VAE comes from a separate loader in the split setups and from slot 2 of the
  // checkpoint otherwise. Every consumer goes through this so the two never diverge.
  const linkVae = (dstId, dstSlot) => {
    if (vaeId !== null) L(vaeId, 0, dstId, dstSlot, "VAE");
    else L(ckId, 2, dstId, dstSlot, "VAE");
  };

  // === LoRA branch ===
  if (cat === "lora") {
    const loId = N("LoraLoader", "Load LoRA", [50, 360], ["your_lora.safetensors", 0.8, 0.8],
      [mkIn("model", "MODEL"), mkIn("clip", "CLIP")],
      [{ name: "MODEL", type: "MODEL", links: [], slot_index: 0 }, { name: "CLIP", type: "CLIP", links: [], slot_index: 1 }]);
    L(ckId, 0, loId, 0, "MODEL"); L(ckId, 1, loId, 1, "CLIP");
    modSrc = loId; modSlot = 0; clipSrc = loId; clipSlot = 1;
  }

  // === Text encoding ===
  const posId = N("CLIPTextEncode", "Positive Prompt", [450, 100], [prompt || "masterpiece, best quality, detailed"], [mkIn("clip", "CLIP")], [mkOut("CONDITIONING", "CONDITIONING")]);
  L(clipSrc, clipSlot, posId, 0, "CLIP");
  const negId = N("CLIPTextEncode", "Negative Prompt", [450, 320], [negPrompt || "blurry, low quality, distorted"], [mkIn("clip", "CLIP")], [mkOut("CONDITIONING", "CONDITIONING")]);
  L(clipSrc, clipSlot, negId, 0, "CLIP");

  let posSrc = posId, negSrc = negId;

  // Flux is guidance-distilled: KSampler cfg must stay at 1.0 and the prompt strength
  // is carried by FluxGuidance instead. Feeding it a normal cfg washes the image out.
  if (isFlux) {
    const fgId = N("FluxGuidance", "Flux Guidance", [700, 100], [clampNum(cfg, 1, 10, 3.5)],
      [mkIn("conditioning", "CONDITIONING")], [mkOut("CONDITIONING", "CONDITIONING")]);
    L(posId, 0, fgId, 0, "CONDITIONING");
    posSrc = fgId;
  }

  // === ControlNet branch (#1 fix) ===
  if (cat === "controlnet") {
    const cnLoadId = N("ControlNetLoader", "Load ControlNet", [50, 580], ["diffusers_xl_canny_full.safetensors"], [], [mkOut("CONTROL_NET", "CONTROL_NET")]);
    const cnImgId = N("LoadImage", "Control Image", [50, 760], ["control_image.png"], [], [mkOut("IMAGE", "IMAGE"), { name: "MASK", type: "MASK", links: [], slot_index: 1 }]);
    const cnApplyId = N("ControlNetApplyAdvanced", "Apply ControlNet", [450, 560], [1.0, 0.0, 1.0],
      [mkIn("positive", "CONDITIONING"), mkIn("negative", "CONDITIONING"), mkIn("control_net", "CONTROL_NET"), mkIn("image", "IMAGE")],
      [{ name: "positive", type: "CONDITIONING", links: [], slot_index: 0 }, { name: "negative", type: "CONDITIONING", links: [], slot_index: 1 }]);
    L(posId, 0, cnApplyId, 0, "CONDITIONING"); L(negId, 0, cnApplyId, 1, "CONDITIONING");
    L(cnLoadId, 0, cnApplyId, 2, "CONTROL_NET"); L(cnImgId, 0, cnApplyId, 3, "IMAGE");
    posSrc = cnApplyId; negSrc = cnApplyId;
  }

  // === Latent source ===
  let latentSrc, latentSlot = 0;
  if (cat === "i2i" || cat === "inpaint") {
    const imgId = N("LoadImage", "Load Input Image", [450, 560], ["input.png"], [], [mkOut("IMAGE", "IMAGE"), { name: "MASK", type: "MASK", links: [], slot_index: 1 }]);
    const vaeEncId = N("VAEEncode", "VAE Encode", [450, 740], [], [mkIn("pixels", "IMAGE"), mkIn("vae", "VAE")], [mkOut("LATENT", "LATENT")]);
    L(imgId, 0, vaeEncId, 0, "IMAGE"); linkVae(vaeEncId, 1);
    latentSrc = vaeEncId;
    if (cat === "inpaint") {
      const maskImgId = N("LoadImage", "Load Mask", [250, 700], ["mask.png"], [], [mkOut("IMAGE", "IMAGE"), { name: "MASK", type: "MASK", links: [], slot_index: 1 }]);
      const toMaskId = N("ImageToMask", "Convert to Mask", [450, 780], ["red"], [mkIn("image", "IMAGE")], [mkOut("MASK", "MASK")]);
      L(maskImgId, 0, toMaskId, 0, "IMAGE");
      const setMaskId = N("SetLatentNoiseMask", "Set Noise Mask", [650, 780], [], [mkIn("samples", "LATENT"), mkIn("mask", "MASK")], [mkOut("LATENT", "LATENT")]);
      L(vaeEncId, 0, setMaskId, 0, "LATENT"); L(toMaskId, 0, setMaskId, 1, "MASK");
      latentSrc = setMaskId;
    }
  } else if (cat === "i2v") {
    // Image-to-Video: load reference image + encode to latent via VAELoader
    const i2vImgId = N("LoadImage", "Reference Image", [450, 560], ["input.png"], [], [mkOut("IMAGE", "IMAGE"), { name: "MASK", type: "MASK", links: [], slot_index: 1 }]);
    const i2vEncId = N("VAEEncode", "VAE Encode", [450, 740], [], [mkIn("pixels", "IMAGE"), mkIn("vae", "VAE")], [mkOut("LATENT", "LATENT")]);
    L(i2vImgId, 0, i2vEncId, 0, "IMAGE");
    linkVae(i2vEncId, 1);
    latentSrc = i2vEncId;
  } else {
    const batchSize = cat === "batch" ? 4 : (isV ? 16 : 1); // video needs frame count
    const emptyId = N("EmptyLatentImage", "Empty Latent", [450, 560], [width || 1024, height || 1024, batchSize], [], [mkOut("LATENT", "LATENT")]);
    latentSrc = emptyId;
  }

  // === KSampler ===
  const denoise = (cat === "i2i") ? 0.65 : (cat === "inpaint") ? 0.85 : (cat === "i2v") ? 0.75 : 1.0;
  const ksCfg = isFlux ? 1.0 : (cfg || 7);
  const ksId = N("KSampler", "KSampler", [850, 200], [s, "randomize", steps || 25, ksCfg, sampler || "euler", scheduler || "normal", denoise],
    [mkIn("model", "MODEL"), mkIn("positive", "CONDITIONING"), mkIn("negative", "CONDITIONING"), mkIn("latent_image", "LATENT")],
    [mkOut("LATENT", "LATENT")]);
  L(modSrc, modSlot, ksId, 0, "MODEL");
  L(posSrc, 0, ksId, 1, "CONDITIONING");
  L(negSrc, cat === "controlnet" ? 1 : 0, ksId, 2, "CONDITIONING");
  L(latentSrc, latentSlot, ksId, 3, "LATENT");

  // === VAE Decode ===
  const vdId = N("VAEDecode", "VAE Decode", [1250, 200], [], [mkIn("samples", "LATENT"), mkIn("vae", "VAE")], [mkOut("IMAGE", "IMAGE")]);
  L(ksId, 0, vdId, 0, "LATENT");
  linkVae(vdId, 1);

  // === Upscale branch (#1 fix) ===
  let finalImgSrc = vdId;
  if (cat === "upscale") {
    const upModelId = N("UpscaleModelLoader", "Load Upscale Model", [1250, 440], ["4x-UltraSharp.pth"], [], [mkOut("UPSCALE_MODEL", "UPSCALE_MODEL")]);
    const upImgId = N("ImageUpscaleWithModel", "Upscale Image", [1550, 320], [], [mkIn("upscale_model", "UPSCALE_MODEL"), mkIn("image", "IMAGE")], [mkOut("IMAGE", "IMAGE")]);
    L(upModelId, 0, upImgId, 0, "UPSCALE_MODEL"); L(vdId, 0, upImgId, 1, "IMAGE");
    finalImgSrc = upImgId;
  }

  // === Save ===
  const saveType = isV ? "SaveAnimatedWEBP" : "SaveImage";
  const saveWv = isV ? ["ComfyUI", 24, "default", 85] : ["ComfyUI"];
  const svId = N(saveType, isV ? "Save Video" : "Save Image", [1800, 200], saveWv, [mkIn("images", "IMAGE")], []);
  L(finalImgSrc, 0, svId, 0, "IMAGE");

  // === Fix link references (O(n) with Map) ===
  const nodeMap = new Map(ns.map(n => [n.id, n]));
  ls.forEach(l => {
    const [i, si, ss, di, ds] = l;
    const sn = nodeMap.get(si);
    const dn = nodeMap.get(di);
    if (sn?.outputs?.[ss] && !sn.outputs[ss].links.includes(i)) sn.outputs[ss].links.push(i);
    if (dn?.inputs?.[ds]) dn.inputs[ds].link = i;
  });

  return { last_node_id: nid - 1, last_link_id: lid - 1, nodes: ns, links: ls, groups: [], config: {}, extra: { ds: { scale: 1, offset: [0, 0] } }, version: 0.4 };
}

// ═══════════════════════════════════════════
// API FORMAT CONVERTER (#11)
// ═══════════════════════════════════════════
export function toAPIFormat(wf) {
  const api = {};
  wf.nodes.forEach(node => {
    const inputs = {};
    node.widgets_values?.forEach((val, idx) => {
      const paramNames = {
        CheckpointLoaderSimple: ["ckpt_name"],
        CLIPTextEncode: ["text"],
        EmptyLatentImage: ["width", "height", "batch_size"],
        KSampler: ["seed", "control_after_generate", "steps", "cfg", "sampler_name", "scheduler", "denoise"],
        SaveImage: ["filename_prefix"],
        SaveAnimatedWEBP: ["filename_prefix", "fps", "lossless", "quality"],
        UNETLoader: ["unet_name", "weight_dtype"],
        DualCLIPLoader: ["clip_name1", "clip_name2", "type"],
        VAELoader: ["vae_name"],
        LoraLoader: ["lora_name", "strength_model", "strength_clip"],
        LoadImage: ["image"],
        ControlNetLoader: ["control_net_name"],
        ControlNetApplyAdvanced: ["strength", "start_percent", "end_percent"],
        UpscaleModelLoader: ["model_name"],
        SetLatentNoiseMask: [],
        ImageToMask: ["channel"],
        VAEEncode: [],
        VAEDecode: [],
        ImageUpscaleWithModel: [],
      };
      const names = paramNames[node.type];
      if (names && names[idx]) inputs[names[idx]] = val;
    });
    node.inputs?.forEach(inp => {
      if (inp.link !== null) {
        const link = wf.links.find(l => l[0] === inp.link);
        if (link) inputs[inp.name] = [String(link[1]), link[2]];
      }
    });
    api[String(node.id)] = { class_type: node.type, inputs };
  });
  return api;
}
