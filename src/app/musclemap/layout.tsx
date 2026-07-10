import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Muscle Anatomy Map',
  description: 'Discover the 3D muscle anatomy map with Synapse Fit. Learn muscle groups, functions, and targeted exercises for optimal fitness.',
  keywords: ['muscle map', 'fitness', 'workout', 'anatomy', 'muscle groups', 'Synapse Fit'],
  openGraph: {
    title: 'Muscle Anatomy Map – Synapse Fit',
    description: 'Explore the 3D muscle anatomy map and learn targeted exercises for optimal fitness.',
    url: `${SITE_URL}/musclemap`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Muscle Anatomy Map – Synapse Fit',
    description: 'Learn muscle groups and targeted exercises.',
  },
  alternates: {
    canonical: `${SITE_URL}/musclemap`,
  },
};

export default function MuscleMapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="sr-only">Muscle Map</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Muscle Map',
            url: `${SITE_URL}/musclemap`,
          }),
        }}
      />
      {children}
    </>
  );
}
