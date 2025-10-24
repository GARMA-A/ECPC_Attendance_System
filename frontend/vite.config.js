import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0', // Expose on all network interfaces
    allowedHosts: ['.a.free.pinggy.link'], // Allow all Pinggy free subdomains (add more if needed, e.g., '.pinggy.io')
    hmr: {
      clientPort: 443, // Match Pinggy's external HTTPS port for HMR
      protocol: 'wss', // Use secure WebSockets
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000", // Your Express backend
        changeOrigin: true,
      },
    },
  },
});
