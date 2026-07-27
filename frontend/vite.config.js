import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
          '/api': {
            target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
            changeOrigin: true,
            secure: false,
          },
          '/socket.io': {
            target: process.env.VITE_BACKEND_URL ? `ws://${process.env.VITE_BACKEND_URL.replace('https://', '').replace('http://', '')}` : 'ws://localhost:5000',
            ws: true,
          },
          '/uploads': {
            target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
            changeOrigin: true,
            secure: false,
          },
    },
  },
});
