import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import fs from "fs";
import "dotenv/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    {
      name: "inject-sw-env",
      closeBundle() {
        let swEnvContent = fs.readFileSync(
          "public/sw-env-template.js",
          "utf-8",
        );
        swEnvContent = swEnvContent.replace(
          "__VITE_FIREBASE_CONFIG__",
          JSON.stringify(process.env.VITE_FIREBASE_CONFIG_JSON),
        );
        fs.writeFileSync("public/sw-env.js", swEnvContent);

        let manifestContent = fs.readFileSync(
          "public/manifest-template.json",
          "utf-8",
        );
        manifestContent = manifestContent.replace(
          /__VITE_APP_ENV__/g,
          process.env.VITE_APP_ENV === "prod"
            ? ""
            : `[${process.env.VITE_APP_ENV || "local"}]`,
        );
        fs.writeFileSync("public/manifest.json", manifestContent);
      },
    },
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "@freedmen-s-trucking/types": path.resolve(
        __dirname,
        "../common/types/src/index.ts",
      ),
    },
  },
  optimizeDeps: {
    entries: ["flowbite-react"],
  },
});
