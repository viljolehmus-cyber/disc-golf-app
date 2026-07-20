import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative base so the build works from any path, e.g. GitHub Pages
  // (https://<user>.github.io/<repo>/). Routing uses hashes, so no
  // server-side fallback is needed.
  base: "./",
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
