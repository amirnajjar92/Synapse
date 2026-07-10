import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Workout Plans',
  description: 'Unlock your potential with tailored workout plans designed for every fitness journey. Elevate your health and transform your life today! - Synapse',
  keywords: ['fitness plans', 'workout plans', 'exercise plans', 'training plans', 'Synapse Fit'],
  openGraph: {
    title: 'Workout Plans – Synapse Fit',
    description: 'Browse and select from tailored workout plans designed for every fitness journey.',
    url: `${SITE_URL}/plan-list`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Workout Plans – Synapse Fit',
    description: 'Tailored workout plans for every fitness journey.',
  },
  alternates: {
    canonical: `${SITE_URL}/plan-list`,
  },
};

export default function PlanListLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Plan List',
            url: `${SITE_URL}/plan-list`,
          }),
        }}
      />
      {children}
    </>
  );
}
