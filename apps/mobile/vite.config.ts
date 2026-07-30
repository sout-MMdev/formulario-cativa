import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const raizMonorepo = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@cativa/nucleo": fileURLToPath(
        new URL("../../packages/nucleo/src", import.meta.url),
      ),
      "@cativa/tema": fileURLToPath(
        new URL("../../packages/tema", import.meta.url),
      ),
    },
  },

  publicDir: "public",

  server: {
    // Porta diferente do desktop: dá para rodar os dois ao mesmo tempo
    port: 5502,
    open: true,
    // host: true expõe na rede local — é assim que se abre o app no
    // celular durante o desenvolvimento (http://<ip-do-pc>:5502)
    host: true,
    fs: {
      allow: [raizMonorepo],
    },
  },

  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
