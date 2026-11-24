/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", lg: "2rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        // Taken from the logo: ring blue, light blue, leaf green, flower red, sun gold
        royal: { 50: "#eef3ff", 100: "#dce6ff", 200: "#bccdfd", 300: "#8eaaf9", 400: "#5286fe", 500: "#3a6ae6", 600: "#2a55bd", 700: "#22459a", 800: "#1d3a7d", 900: "#142a5c", 950: "#0b1a3d" },
        leaf: { 50: "#eff8ea", 100: "#dcefd0", 500: "#2a9104", 600: "#227a03", 700: "#1b6103" },
        ember: { 50: "#fdf0ef", 500: "#c8372d", 600: "#a82c24" },
        sun: { 100: "#fbf0d2", 400: "#f2c94c", 500: "#e0a82e", 600: "#b9861c" },
        sand: { 50: "#fbf8f3", 100: "#f5f0e7", 200: "#e9e0d0", 300: "#d6c8b0" },
        ink: { DEFAULT: "#151b2c", soft: "#4a5268", mute: "#7a8296" },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Serif Ethiopic"', "Georgia", "serif"],
        sans: ["Inter", '"Noto Sans Ethiopic"', "system-ui", "sans-serif"],
        "serif-am": ['"Noto Serif Ethiopic"', '"Playfair Display"', "serif"],
        "sans-am": ['"Noto Sans Ethiopic"', "Inter", "sans-serif"],
      },
      boxShadow: { soft: "0 1px 2px rgba(11,26,61,.04), 0 12px 40px -12px rgba(11,26,61,.18)", lift: "0 30px 60px -20px rgba(11,26,61,.35)" },
      letterSpacing: { eyebrow: ".22em" },
    },
  },
  plugins: [],
};
