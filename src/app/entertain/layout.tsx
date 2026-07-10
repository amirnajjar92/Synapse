import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Fitness Entertainment',
  description: 'Stay inspired with the latest fitness news, workout videos, and local events. Elevate your fitness journey with Synapse Fit.',
  keywords: ['fitness', 'entertainment', 'workouts', 'health', 'fun', 'Synapse Fit'],
  openGraph: {
    title: 'Fitness Entertainment – Synapse Fit',
    description: 'Stay inspired with fitness news, workout videos, and local events.',
    url: `${SITE_URL}/entertain`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fitness Entertainment – Synapse Fit',
    description: 'Fitness news, workout videos, and local events.',
  },
  alternates: {
    canonical: `${SITE_URL}/entertain`,
  },
};

export default function EntertainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Entertainment Page',
            url: `${SITE_URL}/entertain`,
          }),
        }}
      />
      {children}
    </>
  );
}
