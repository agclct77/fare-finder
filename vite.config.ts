import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Plain Vite + React SPA config — no SSR, no server entry, no Cloudflare/nitro build target.
// `vite build` emits a static bundle to dist/ suitable for any static host (Vercel included).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    outDir: "dist",
  },
});
