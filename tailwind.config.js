/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts}"],
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
