import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const BASE_URL = 'https://sarukhan.dev';
const TITLE = 'Sarukhan Muthuraman — Full Stack Developer';
const DESCRIPTION =
  'Interactive 3D digital identity card of Sarukhan Muthuraman, Full Stack Developer. Neophile • Vagabond • Eleutheromaniac.';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['Sarukhan', 'Full Stack Developer', 'Portfolio', 'React', 'Next.js', 'Digital Card'],
  authors: [{ name: 'Sarukhan Muthuraman', url: BASE_URL }],
  creator: 'Sarukhan Muthuraman',
  robots: { index: true, follow: true },
  alternates: { canonical: BASE_URL },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Sarukhan Digital Card',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    creator: '@thedirtyastro',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#050608',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
