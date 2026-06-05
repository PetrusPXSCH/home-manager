import type { Metadata } from "next";
import "./globals.css";
import ProtectionPage from "@/components/ProtectionPage";

export const metadata: Metadata = {
  title: "Home Manager",
  description: "Factures, budget et documents familiaux",

  manifest: "/manifest.webmanifest",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Home Manager",
  },

  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <ProtectionPage>{children}</ProtectionPage>
      </body>
    </html>
  );
}