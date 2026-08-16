import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",

  plugins: [
    react(),
  ],

  build: {
    outDir: "dist",
    emptyOutDir: true,

    rollupOptions: {
      input: {
        popup: "index.html",

        background:
          "src/background/service-worker.ts",

        content:
          "src/content/content-script.ts",
      },

      output: {
        entryFileNames: (
          chunkInfo,
        ) => {
          if (
            chunkInfo.name ===
            "background"
          ) {
            return "background.js";
          }

          if (
            chunkInfo.name ===
            "content"
          ) {
            return "content.js";
          }

          return "assets/[name]-[hash].js";
        },

        chunkFileNames:
          "assets/[name]-[hash].js",

        assetFileNames:
          "assets/[name]-[hash][extname]",
      },
    },
  },
});