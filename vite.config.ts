import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    strictPort: true,
    hmr: { host: "sususu.localhost", clientPort: 5174 },
    proxy: { "/api": "http://localhost:3001" },
  },
  preview: { host: "0.0.0.0", port: 5174, strictPort: true },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        reading: resolve(__dirname, "reading.html"),
      },
    },
  },
});
