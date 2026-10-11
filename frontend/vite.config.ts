import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:5080",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "es2022",
    sourcemap: false,
    // Archivos con hash en /static/ (caché inmutable en nginx); /assets/ queda para
    // las imágenes de public/ (ingredientes, pizzas), que no llevan hash.
    assetsDir: "static",
  },
});
