import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  // This matches your repository name exactly
  base: "/bhs40reunion/",

  plugins: [
    ViteImageOptimizer({
      // High-quality compression for reunion photos
      jpg: { quality: 75 },
      png: { quality: 80 },
      webp: { lossy: true, quality: 75 },
      avif: { quality: 70 },
    }),
  ],

  build: {
    // Ensures a clean build for GitHub Pages
    outDir: "dist",
    assetsInlineLimit: 4096, // Files smaller than 4kb become base64 to save requests
  },
});
