import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Static build for GitHub Pages. Relative base works at both
 *  https://diffstab.cods.co.nz/ and https://mattcodlin.github.io/diffstab/ */
export default defineConfig({
  root: fileURLToPath(new URL("./pages", import.meta.url)),
  base: "./",
  publicDir: fileURLToPath(new URL("./pages/public", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL("./dist-pages", import.meta.url)),
    emptyOutDir: true,
  },
});
