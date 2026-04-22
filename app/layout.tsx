import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Attentiq",
  description:
    "Diagnostic structurel de la rétention sur les formats courts.",
  openGraph: {
    title: "Attentiq",
    description:
      "Diagnostic structurel de la rétention sur les formats courts.",
    siteName: "Attentiq",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${dmSans.variable}`}>
      <head>
        <script
          src="https://phospho-nanocorp-prod--nanocorp-api-fastapi-app.modal.run/beacon/snippet.js?s=attentiq"
          defer
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
