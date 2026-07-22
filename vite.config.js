import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import injectHTML from "vite-plugin-html-inject";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { resolve } from "path"; // Required for multiple entry points

export default defineConfig({
  base: "/",
  server: {
    host: true,
    port: 5173, // Forces Vite to use this consistent port number
  },
  plugins: [
    ViteImageOptimizer({
      jpg: { quality: 75 },
      png: { quality: 80 },
      webp: { lossy: true, quality: 75 },
      avif: { quality: 70 },
    }),
    injectHTML(),
    createHtmlPlugin({
      minify: {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: true,
        removeRedundantAttributes: false, // <-- THIS IS THE KEY FIX
        removeScriptTypeAttributes: false,
        removeStyleLinkTypeAttributes: false,
        useShortDoctype: true,
      },
      inject: {
        data: {
          title: "BHS Class of 86",
        },
        tags: [
          {
            injectTo: "body-prepend",
            tag: "div",
            attrs: {
              id: "header",
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: "dist",
    assetsInlineLimit: 4096,
    minify: 'esbuild',
    // Keep target high enough so it doesn't overly transform markup
    target: 'esnext',
    // Add rollupOptions here to include the new page
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        contact: resolve(__dirname, "contact.html"),
        missing: resolve(__dirname, "missing.html"),
        memoriam: resolve(__dirname, "memoriam.html"),
      },
    },
  },
});
