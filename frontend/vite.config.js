import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind CSS v4 — uses Vite plugin, no tailwind.config.js needed
  ],
  server: {
    port: 5173,
    // Proxy /api requests to the backend server
    // This means fetch("/api/analyze") in React → http://localhost:5000/api/analyze
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
