import {
  defineConfig,
  minimal2023Preset as preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
    includeId: true,
  },
  overrideAssets: true,
  preset,
  images: ["public/logo-lg.png"],
});
