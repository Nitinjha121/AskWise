import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // The browser calls same-origin /api/*, and Vite forwards it to the backend.
    // So the frontend never needs the backend's address and no CORS is needed.
    proxy: {
      "/api": "http://localhost:3000"
    }
  }
});
