import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "./",
  // Watching backend/ (about 15,000 files, and Laravel writes into it) freezes the dev server.
  server: { watch: { ignored: ["**/backend/**", "**/dist/**", "**/marketing/**"] } },
});
