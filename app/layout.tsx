import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Attentiq — Analyse TikTok par IA',
    template: '%s | Attentiq',
  },
  description:
    'Attentiq analyse vos vidéos TikTok avec l\'IA pour identifier ce qui capte l\'attention et maximiser votre engagement.',
  keywords: ['TikTok', 'analyse vidéo', 'IA', 'engagement', 'créateur de contenu'],
  authors: [{ name: 'Attentiq' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://attentiq.com',
    siteName: 'Attentiq',
    title: 'Attentiq — Analyse TikTok par IA',
    description:
      'Analysez vos vidéos TikTok avec l\'IA pour maximiser votre engagement.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Attentiq — Analyse TikTok par IA',
    description:
      'Analysez vos vidéos TikTok avec l\'IA pour maximiser votre engagement.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
