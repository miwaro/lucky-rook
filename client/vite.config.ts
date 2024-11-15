import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", //TODO: Update to AWS URL
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
});
