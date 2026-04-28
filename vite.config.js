import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";
import injectHTML from "vite-plugin-html-inject";
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
    injectHTML(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          // You can even pass dynamic data here, like the reunion year!
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
