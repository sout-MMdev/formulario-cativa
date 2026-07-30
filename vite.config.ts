import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // "@/..." aponta sempre para src/ — evita ../../../ nos imports
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  // Arquivos estáticos servidos direto (agencias.json, imagens)
  publicDir: "public",

  server: {
    port: 5501,
    open: true,
    host: true,
  },

  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
