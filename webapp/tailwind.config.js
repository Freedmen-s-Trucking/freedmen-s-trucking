import flowbite from "flowbite-react/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      screens: {
        xs: "380px",
      },
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
  plugins: [flowbite.plugin()],
};
