import flowbite from "flowbite-react/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      screens: {
        xs: "380px",
      },
      fontFamily: {
        mobile: ['Georgia', 'serif'],
      },
      borderRadius: {
        mobile: '7px', // middle value between 6-8px
      },
      colors: {
        primary: {
          50: "#FFFCFA",
          100: "#F2E7D8",
          200: "#BAA596",
          300: "#9B826F",
          400: "#856851",
          500: "#6F4F35",
          600: "#64462F",
          700: "#553A26",
          800: "#472E1E",
          900: "#382114",
          950: "#331D10",
        },
        secondary: {
          50: "#E2EFFF",
          100: "#C1D7E8",
          200: "#A2BACF",
          300: "#819EB7",
          400: "#6989A4",
          500: "#507592",
          600: "#436781",
          700: "#34536B",
          800: "#264155",
          900: "#142C3D",
          950: "#001829",
        },
        accent: {
          50: "#F2E7D8",
          100: "#E1C39B",
          200: "#CC9B58",
          300: "#B7760E",
          400: "#AA5D00",
          500: "#9D4400",
          600: "#9B3A00",
          700: "#972B00",
          800: "#901400",
          900: "#870000",
        },
        mobile: {
          background: "#F7E9D0",
          text: "#3B2E20",
          button: {
            DEFAULT: "#3B2E20",
            text: "#FFFFFF"
          }
        }
      },
    },
  },
  plugins: [flowbite.plugin()],
};
