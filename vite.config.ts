import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      injectRegister: "auto",

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png"
      ],

      manifest: {
        name: "PoojaSathi",
        short_name: "Pooja",

        description:
          "Collaborative workspace for Pandit and Yajmaan",

        theme_color: "#D97706",

        background_color: "#FFF8F0",

        display: "standalone",

        orientation: "portrait",

        scope: "/",

        start_url: "/",

        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },

          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],

  optimizeDeps: {
    exclude: ["lucide-react"]
  }
});