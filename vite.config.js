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
        stringArrayEncoding: ["rc4"],
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
        unicodeEscapeSequence: true,
      },
    }),
  ],
  base: "/",
});
