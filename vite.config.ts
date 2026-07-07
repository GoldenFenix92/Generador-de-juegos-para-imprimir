import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const base = process.env.GITHUB_ACTIONS ? "/Generador-de-juegos-para-imprimir/" : "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
