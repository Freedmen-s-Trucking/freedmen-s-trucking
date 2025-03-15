const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/preline/preline.js",
    // ...
    flowbite.content(),
  ],
  plugins: [
    require("preline/plugin"),
    // ...
    flowbite.plugin(),
  ],
  theme: {
    extend: {},
  },
};
