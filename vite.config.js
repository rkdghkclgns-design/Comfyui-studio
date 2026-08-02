import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteObfuscateFile } from "vite-plugin-obfuscator";
import prerender from "@prerenderer/rollup-plugin";
import PuppeteerRenderer from "@prerenderer/renderer-puppeteer";

const prerenderRoutes = [
  "/landing",
  "/guides",
  "/guides/comfyui-beginners-guide",
  "/guides/comfyui-workflow-guide",
  "/guides/comfyui-model-guide",
  "/guides/comfyui-vs-a1111",
  "/guides/controlnet-complete-guide",
  "/guides/lora-usage-guide",
  "/guides/vram-optimization-guide",
  "/guides/flux-model-guide",
  "/guides/comfyui-video-guide",
  "/guides/comfyui-custom-nodes",
  "/guides/comfyui-prompt-engineering",
  // "/showcase" is intentionally NOT prerendered: it renders user-submitted posts,
  // which would be frozen into static HTML until the next deploy (a deleted post
  // would keep serving) and cannot be moderated between builds.
  "/about",
  "/privacy",
  "/terms",
];

export default defineConfig({
  plugins: [
    react(),
    viteObfuscateFile({
      exclude: [
        /LandingPage/,
        /GuidesIndex/,
        /GuideArticle/,
        /AboutPage/,
        /PrivacyPage/,
        /TermsPage/,
        /ShowcasePage/,
        /ContentLayout/,
        /AdUnit/,
        /guides/,
      ],
      // Obfuscation raises the cost of casual reading; it cannot keep a secret.
      // Anything that must stay secret lives behind the Edge Function, not in here.
      // The aggressive options previously enabled (debugProtection's 2s interval,
      // selfDefending, deadCodeInjection, controlFlowFlattening at 0.75 over a
      // 4k-line file) cost real CPU and bundle size — which AdSense revenue tracks
      // via Core Web Vitals — while disableConsoleOutput removed the only way to
      // observe production failures.
      options: {
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: false,
        identifierNamesGenerator: "hexadecimal",
        renameGlobals: false,
        selfDefending: false,
        simplify: true,
        splitStrings: false,
        stringArray: true,
        stringArrayCallsTransform: false,
        stringArrayEncoding: [],
        stringArrayIndexesType: ["hexadecimal-number"],
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayThreshold: 0.75,
        transformObjectKeys: false,
        unicodeEscapeSequence: false,
      },
    }),
    prerender({
      routes: prerenderRoutes,
      renderer: new PuppeteerRenderer({
        renderAfterTime: 3000,
        headless: true,
        // AdUnit checks this flag and renders a placeholder instead of a live ad,
        // so no loaded ad is serialized into the static HTML.
        inject: {},
        injectProperty: "__PRERENDER_INJECTED",
      }),
      postProcess(renderedRoute) {
        // Inject meta charset for proper Korean encoding
        if (!renderedRoute.html.includes('<meta charset')) {
          renderedRoute.html = renderedRoute.html.replace('<head>', '<head><meta charset="UTF-8">');
        }
        // Decode unicode escape sequences to actual characters (Korean, emoji, etc.)
        renderedRoute.html = renderedRoute.html.replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) =>
          String.fromCharCode(parseInt(hex, 16))
        );
        // Belt-and-braces: strip any AdSense artifacts that still made it into the
        // snapshot, so the live page always owns the ad lifecycle.
        renderedRoute.html = renderedRoute.html
          .replace(/<script[^>]*pagead2\.googlesyndication\.com[^>]*>\s*<\/script>/g, "")
          .replace(/\sdata-adsbygoogle-status="[^"]*"/g, "")
          .replace(/\sdata-ad-status="[^"]*"/g, "");
      },
    }),
  ],
  base: "/",
});
