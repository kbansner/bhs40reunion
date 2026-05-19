/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts}",
    "./src/js/class-list.js",
    "./src/js/main.js",
  ],
  safelist: ["capitalize", "ml-0.5"],
  plugins: [],
  theme: {
    extend: {
      fontFamily: {
        // MUST match the name used in your JS/HTML
        handwriting: ["Caveat", "cursive"],
      },
    },
  },
};
