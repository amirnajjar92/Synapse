import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Fitness Events',
  description: 'Join the best local fitness events, competitions, and wellness activities with Synapse Fit. Connect and elevate your fitness journey.',
  keywords: ['fitness events', 'workout events', 'Synapse Fit events', 'training sessions', 'wellness activities'],
  openGraph: {
    title: 'Fitness Events – Synapse Fit',
    description: 'Join local fitness events, competitions, and wellness activities with Synapse Fit.',
    url: `${SITE_URL}/events`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fitness Events – Synapse Fit',
    description: 'Local fitness events, competitions, and wellness activities.',
  },
  alternates: {
    canonical: `${SITE_URL}/events`,
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Upcoming Events at Synapse Fit',
            url: `${SITE_URL}/events`,
          }),
        }}
      />
      {children}
    </>
  );
}
