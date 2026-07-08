import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the build works at a GitHub Pages project subpath
  // (https://<user>.github.io/<repo>/). Paired with HashRouter, all asset URLs
  // resolve relative to index.html and routing lives in the URL hash.
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // Split out the largest leaf libraries; everything else (incl. React)
          // stays in a single vendor chunk to avoid circular chunk graphs.
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("framer-motion")) return "motion";
          return "vendor";
        },
      },
    },
  },
  server: {
    port: 5173,
    // Proxy API calls to the FastAPI backend during development.
    // The frontend works standalone (mock mode) without this, but when
    // VITE_USE_MOCK=false the axios baseURL "/api/v1" is proxied here.
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
