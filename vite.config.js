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
  "/showcase",
  "/about",
  "/privacy",
  "/terms",
];

export default defineConfig({
  plugins: [
    react(),
    viteObfuscateFile({
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: true,
        debugProtectionInterval: 2000,
        disableConsoleOutput: true,
        identifierNamesGenerator: "hexadecimal",
        renameGlobals: false,
        selfDefending: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 3,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayCallsTransformThreshold: 0.75,
        stringArrayEncoding: ["base64"],
        stringArrayIndexesType: ["hexadecimal-number"],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 3,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 4,
        stringArrayWrappersType: "function",
        stringArrayThreshold: 1,
        transformObjectKeys: true,
        unicodeEscapeSequence: false,
      },
    }),
    prerender({
      routes: prerenderRoutes,
      renderer: new PuppeteerRenderer({
        renderAfterTime: 3000,
        headless: true,
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
      },
    }),
  ],
  base: "/",
});
