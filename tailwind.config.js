/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        cymruRed: {
          800: "#991b1b",
          600: "#dc2626",
        },
        emeraldInk: {
          900: "#064e3b",
          700: "#0f766e",
        },
      },
    },
  },
  plugins: [],
};
