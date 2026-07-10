import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'AI Workout Planner',
  description: "Unlock your potential with Synapse Fit's personalized AI Workout Planner – tailored training plans for your unique fitness goals.",
  keywords: ['AI workout planner', 'personalized training plans', 'fitness goals', 'workout generator', 'Synapse Fit'],
  openGraph: {
    title: 'AI Workout Planner – Synapse Fit',
    description: "Create personalized AI-driven workout plans tailored to your fitness goals with Synapse Fit's workout planner.",
    url: `${SITE_URL}/planner`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Workout Planner – Synapse Fit',
    description: "Tailored AI workout plans for your unique fitness goals.",
  },
  alternates: {
    canonical: `${SITE_URL}/planner`,
  },
};

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'AI Workout Planner – Synapse Fit',
            description: "Create personalized AI-driven workout plans tailored to your unique fitness goals.",
            url: `${SITE_URL}/planner`,
          }),
        }}
      />
      {children}
    </>
  );
}
