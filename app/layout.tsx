import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
});

function getMetadataBase(): URL | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return undefined;
  }
  try {
    return new URL(raw);
  } catch {
    return undefined;
  }
}

const metadataBase = getMetadataBase();

export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),
  title: {
    default: "Attentiq — Où l'attention chute, et quoi corriger",
    template: "%s — Attentiq",
  },
  description:
    "Analyse d'attention sur vidéos courtes, textes et images : signaux clairs, priorités actionnables, sans promesse creuse.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "Attentiq — Où l'attention chute, et quoi corriger",
    description:
      "Analyse d'attention multi-formats : ce qui fait décrocher, puis le plan de correction priorisé.",
    siteName: "Attentiq",
  },
  twitter: {
    card: "summary_large_image",
    title: "Attentiq",
    description:
      "Où l'attention chute sur vos contenus courts — et quoi corriger en premier.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={dmSans.variable}>
      <head>
        <script
          src="https://phospho-nanocorp-prod--nanocorp-api-fastapi-app.modal.run/beacon/snippet.js?s=attentiq"
          defer
        />
      </head>
      <body className={`min-h-screen ${dmSans.className}`}>{children}</body>
    </html>
  );
}
