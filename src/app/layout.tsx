import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/lib/redux/StoreProvider';
import Providers from './providers';
import Sidebar from '@/components/Sidebar';
import { SidebarProvider } from '@/components/SidebarContext';
import PWAUpdater from '@/components/PWAUpdater';
import PWAInstallButton from '@/components/PWAInstallButton';
import { Hanalei_Fill } from "next/font/google";

const hanaleiFill = Hanalei_Fill({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hanalei-fill",
});

export const metadata: Metadata = {
  title: 'Synapse - Fitness & Health Tracker',
  description: 'Your personal fitness and health tracking companion',
  manifest: '/manifest.json',
  themeColor: '#3B63CF',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Synapse',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
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
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Synapse" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`antialiased`}
      >
        <PWAUpdater />
        <PWAInstallButton />
        <Providers>
          <StoreProvider>
            <SidebarProvider>
              <Sidebar />
              {children}
            </SidebarProvider>
          </StoreProvider>
        </Providers>
      </body>
    </html>
  );
}
