import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: "prompt",
        includeAssets: ["favicon.png", "robots.txt", "apple-touch-icon.png"],
        manifest: {
          name: "A Forja — Event Command Center",
          short_name: "A Forja",
          description: "Centro de comando operacional do evento A Forja.",
          theme_color: "#E6BC63",
          background_color: "#050505",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "icons/icon-192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "pages",
                expiration: {
                  maxEntries: 50,
                },
              },
            },
          ],
          navigateFallback: "/",
          // Exclude OAuth and API from service worker control
          navigateFallbackDenylist: [/^\/~oauth/, /^\/api/],
        },
        devOptions: {
          enabled: false, // Disable in dev/preview as per instructions
        },
      }),
    ],
  },
});
