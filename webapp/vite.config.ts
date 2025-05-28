import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
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
      },
    },
    VitePWA({
      strategies: "injectManifest",
      // when using strategies 'injectManifest' you need to provide the srcDir
      srcDir: "src",
      // when using strategies 'injectManifest' use claims-sw.ts or prompt-sw.ts
      filename: "app-sw.ts",
      pwaAssets: {
        disabled: false,
        config: true,
        htmlPreset: "2023",
        overrideManifestIcons: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,svg,ico}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,svg,ico}"],
      },
      registerType: "prompt",
      manifest: {
        name: `${process.env.VITE_APP_ENV === "prod" ? "" : `[${process.env.VITE_APP_ENV || "local"}] `}Freedmen's Trucking`,
        short_name: `${process.env.VITE_APP_ENV === "prod" ? "" : `[${process.env.VITE_APP_ENV || "local"}] `}Freedmen's Trucking`,
        start_url: "/",
        display: "minimal-ui",
        description:
          "Same-Day Delivery, simplified. We are a fast, reliable, and efficient truck dispatching services tailored to your needs.",
        background_color: "#FFFCFA",
        theme_color: "#382114",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      devOptions: {
        enabled: true,
        navigateFallback: "index.html",
        suppressWarnings: true,
        /* when using generateSW the PWA plugin will switch to classic */
        type: "module",
      },
    }),
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
