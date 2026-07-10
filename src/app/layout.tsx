import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';
import AppShell from '@/components/AppShell';
import { Hanalei_Fill } from "next/font/google";

const hanaleiFill = Hanalei_Fill({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hanalei-fill",
});

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Synapse — AI Fitness & Health Tracker',
    template: '%s | Synapse Fit',
  },
  description: "Unlock your fitness potential with Synapse's AI-driven training plans and progress tracking. Join us today!",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Synapse',
  },
  openGraph: {
    title: 'Transform Your Fitness with Synapse',
    description: 'Elevate your health journey with AI-driven fitness plans and tracking. Discover the future of wellness today! - Synapse's AI-driven training plans and progress tracking. Join today and start your journey!',
    url: SITE_URL,
    siteName: 'Synapse Fit',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synapse — AI Fitness & Health Tracker',
    description: 'AI-powered workout planning, progress tracking, and trainer collaboration.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={hanaleiFill.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Synapse" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className={`antialiased`}>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
