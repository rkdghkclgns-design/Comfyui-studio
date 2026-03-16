import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteObfuscateFile } from "vite-plugin-obfuscator";

export default defineConfig({
  plugins: [
    react(),
    viteObfuscateFile({
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.5,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.2,
        debugProtection: false,
        identifierNamesGenerator: "hexadecimal",
        renameGlobals: false,
        selfDefending: false,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 5,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayEncoding: ["base64"],
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 2,
        stringArrayWrappersType: "function",
        stringArrayThreshold: 0.75,
        transformObjectKeys: true,
        unicodeEscapeSequence: false,
      },
    }),
  ],
  base: "/",
});
