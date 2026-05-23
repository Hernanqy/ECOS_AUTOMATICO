import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo-municipio.png", "personaje.png"],
      manifest: {
        name: "Ecos de La Máxima",
        short_name: "Ecos",
        description: "Experiencia interactiva del Polo Educativo La Máxima",
        theme_color: "#0057d9",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "/logo-municipio.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/logo-municipio.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});
