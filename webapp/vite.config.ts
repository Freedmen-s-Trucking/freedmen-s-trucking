import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
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
