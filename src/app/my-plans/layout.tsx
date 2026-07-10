import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'My Training Plans',
  description: 'Unlock your potential with personalized AI-driven training plans designed for your fitness goals. Transform your journey with Synapse.',
  keywords: ['fitness', 'plans', 'exercise', 'health', 'training plans', 'Synapse Fit'],
  openGraph: {
    title: 'My Training Plans – Synapse Fit',
    description: 'Browse and manage your personalized AI-driven training plans.',
    url: `${SITE_URL}/my-plans`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Training Plans – Synapse Fit',
    description: 'Manage your personalized fitness plans.',
  },
  alternates: {
    canonical: `${SITE_URL}/my-plans`,
  },
};

export default function MyPlansLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'My Plans',
            url: `${SITE_URL}/my-plans`,
          }),
        }}
      />
      {children}
    </>
  );
}
