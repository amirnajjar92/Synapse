import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Training Studio for Coaches',
  description: "Elevate your coaching with Synapse Fit's advanced training studio for efficient client management and tailored coaching solutions.",
  keywords: ['training', 'fitness', 'studio', 'workouts', 'personal training', 'Synapse Fit'],
  openGraph: {
    title: 'Training Studio for Coaches – Synapse Fit',
    description: "Manage clients, plan workouts, and elevate your coaching with Synapse Fit's training studio.",
    url: `${SITE_URL}/training-studio`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Training Studio for Coaches – Synapse Fit',
    description: 'Client management and coaching tools for fitness professionals.',
  },
  alternates: {
    canonical: `${SITE_URL}/training-studio`,
  },
};

export default function TrainingStudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Training Studio for Coaches',
            description: "Elevate your coaching with Synapse Fit's training studio for client management and workout planning.",
            url: `${SITE_URL}/training-studio`,
          }),
        }}
      />
      {children}
    </>
  );
}
