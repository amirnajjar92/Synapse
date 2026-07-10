import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Water Intake Tracker',
  description: "Monitor your daily water consumption and improve your hydration with Synapse Fit's innovative water tracker.",
  keywords: ['water tracker', 'hydration', 'health', 'fitness', 'water intake', 'Synapse Fit'],
  openGraph: {
    title: 'Water Intake Tracker – Synapse Fit',
    description: 'Track your daily water intake and stay hydrated with Synapse Fit.',
    url: `${SITE_URL}/water-tracker`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Water Intake Tracker – Synapse Fit',
    description: 'Track your daily water intake and hydration goals.',
  },
  alternates: {
    canonical: `${SITE_URL}/water-tracker`,
  },
};

export default function WaterTrackerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="sr-only">Water Tracker</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Water Tracker',
            url: `${SITE_URL}/water-tracker`,
            description: 'Track your daily water intake easily with our water tracker.',
          }),
        }}
      />
      {children}
    </>
  );
}
