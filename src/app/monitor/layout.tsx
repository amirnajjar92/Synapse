import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Health Monitor',
  description: 'Monitor your heart health and wellness with Synapse Fit\'s advanced tools for cardio training and recovery.',
  keywords: ['health monitor', 'heart health', 'wellness', 'cardio training', 'recovery', 'Synapse Fit'],
  openGraph: {
    title: 'Health Monitor – Synapse Fit',
    description: 'Monitor your heart health and wellness with advanced cardio training and recovery tools.',
    url: `${SITE_URL}/monitor`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Health Monitor – Synapse Fit',
    description: 'Advanced tools for cardio training and recovery.',
  },
  alternates: {
    canonical: `${SITE_URL}/monitor`,
  },
};

export default function MonitorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="sr-only">Health Monitor</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Health Monitor',
            url: `${SITE_URL}/monitor`,
            description: 'Monitor your heart health and wellness with Synapse Fit.',
          }),
        }}
      />
      {children}
    </>
  );
}
