import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const BASE_URL = 'https://sarukhan-digital-card.vercel.app';
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
    icon: [
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_io/favicon.ico' },
    ],
    apple: '/favicon_io/apple-touch-icon.png',
    other: [
      { rel: 'android-chrome-192x192', url: '/favicon_io/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/favicon_io/android-chrome-512x512.png' },
      { rel: 'manifest', url: '/favicon_io/site.webmanifest' },
    ],
  },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Sarukhan Digital Card',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    creator: '@thedirtyastro',
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