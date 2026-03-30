import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { resolve } from "path"; // Required for multiple entry points

export default defineConfig({
  base: "/",

  plugins: [
    ViteImageOptimizer({
      jpg: { quality: 75 },
      png: { quality: 80 },
      webp: { lossy: true, quality: 75 },
      avif: { quality: 70 },
    }),
  ],

  build: {
    outDir: "dist",
    assetsInlineLimit: 4096,
    // Add rollupOptions here to include the new page
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        contact: resolve(__dirname, "contact.html"),
        missing: resolve(__dirname, "missing.html"),
      },
    },
  },
});
