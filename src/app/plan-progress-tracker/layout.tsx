import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Progress Tracker',
  description: 'Unlock your potential and track your fitness journey with precision. Elevate your progress and achieve your goals today! - Synapse',
  keywords: ['progress tracker', 'fitness progress', 'workout tracking', 'plan progress', 'Synapse Fit'],
  openGraph: {
    title: 'Plan Progress Tracker – Synapse Fit',
    description: 'Track your fitness journey with precision and achieve your goals with Synapse Fit.',
    url: `${SITE_URL}/plan-progress-tracker`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plan Progress Tracker – Synapse Fit',
    description: 'Track your fitness journey and plan progress.',
  },
  alternates: {
    canonical: `${SITE_URL}/plan-progress-tracker`,
  },
};

export default function PlanProgressLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Plan Progress Tracker',
            url: `${SITE_URL}/plan-progress-tracker`,
            description: 'Track your fitness journey with precision and achieve your goals.',
          }),
        }}
      />
      {children}
    </>
  );
}
