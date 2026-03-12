import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
          '/api': {
            target: process.env.VITE_BACKEND_URL || 'https://gen-ai-placement-management-syste.onrender.com',
            changeOrigin: true,
            secure: false,
          },
          '/socket.io': {
            target: process.env.VITE_BACKEND_URL ? `ws://${process.env.VITE_BACKEND_URL.replace('https://', '')}` : 'wss://gen-ai-placement-management-syste.onrender.com',
            ws: true,
          },
    },
  },
});
