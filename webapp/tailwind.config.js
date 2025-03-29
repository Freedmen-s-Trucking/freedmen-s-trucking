import flowbite from "flowbite-react/plugin/tailwindcss";
import flowbiteReact from "flowbite-react/plugin/tailwindcss";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    ".flowbite-react/class-list.json",
  ],
  theme: {
    extend: {
      colors: {
        // Override primary colors
        primary: {
          50: "#F5F0E4",
          100: "#F2E7D8",
          200: "#EED4C6",
          300: "#E8CFA5",
          400: "#E2BE93",
          500: "#E2BE93",
          600: "#DCB07A",
          700: "#553A26",
          800: "#45391C",
          900: "#2E2616",
        },
      },
    },
  },
  plugins: [flowbite, flowbiteReact],
};