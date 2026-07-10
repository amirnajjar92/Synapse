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
  keywords: ['AI fitness', 'workout planner', 'health tracker', 'personal training', 'fitness app'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Synapse',
  },
  openGraph: {
    title: 'Transform Your Fitness with Synapse',
    description: "Elevate your health journey with AI-driven fitness plans and tracking. Discover the future of wellness today! - Synapse's AI-driven training plans and progress tracking. Join today and start your journey!",
    url: SITE_URL,
    siteName: 'Synapse Fit',
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512, alt: 'Synapse Fit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synapse — AI Fitness & Health Tracker',
    description: 'AI-powered workout planning, progress tracking, and trainer collaboration.',
    images: [`${SITE_URL}/icons/icon-512x512.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
}

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
        <link rel="alternate" hrefLang="en-US" href={SITE_URL} />
        <link rel="alternate" hrefLang="en" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: 'Synapse — AI Fitness & Health Tracker',
              description: "Unlock your fitness potential with Synapse's AI-driven training plans and progress tracking.",
              url: SITE_URL,
            }),
          }}
        />
      </head>
      <body className={`antialiased`}>
        <h1 className="sr-only">Synapse — AI Fitness &amp; Health Tracker</h1>
        <nav className="sr-only" aria-label="Primary navigation">
          <a href="/planner">AI Workout Planner</a>
          <a href="/workout-planner">Workout Planner</a>
          <a href="/workout-tracker">Workout Tracker</a>
          <a href="/blog">Fitness Blog</a>
          <a href="/training-chat">Training Chat</a>
          <a href="/landing">About Synapse Fit</a>
        </nav>
        <Providers>
          <AppShell>
            {children}
          </AppShell>
        </Providers>
      </body>
    </html>
  );
}
