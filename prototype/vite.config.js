import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Lokale preview van de Base44-module. De echte code staat in ../base44-app;
// alleen de Base44-client en de shadcn/ui-componenten worden hier nagebootst.
const r = (p) => path.resolve(__dirname, p);

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "react-router-dom", "lucide-react", "react-markdown"],
    alias: [
      { find: "@/api/base44Client", replacement: r("src/mock/base44Client.js") },
      { find: /^@\/components\/ui\/(.*)$/, replacement: r("src/ui/$1.jsx") },
      { find: "@/components/leeromgeving", replacement: r("../base44-app/src/components/leeromgeving") },
      { find: "@/pages", replacement: r("../base44-app/src/pages") },
    ],
  },
  server: { fs: { allow: [r("..")] } },
  // De module-bestanden staan buiten deze map; laat ze de packages van het prototype gebruiken.
});
