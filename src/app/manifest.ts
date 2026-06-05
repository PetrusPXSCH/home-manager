import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Home Manager",
    short_name: "HomeManager",
    description: "Gestion familiale des factures, documents et budget",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}