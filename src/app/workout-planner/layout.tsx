import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Workout Planner',
  description: "Create custom workout plans and track your fitness journey effectively with Synapse Fit's powerful planner.",
  keywords: ['workout planner', 'fitness', 'exercise planning', 'workout routine', 'Synapse Fit'],
  openGraph: {
    title: 'Elevate Your Fitness with Synapse',
    description: "Design your personalized workout plan and achieve your fitness goals with Synapse Fit's intuitive workout planner.",
    url: `${SITE_URL}/workout-planner`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synapse Workout Planner',
    description: 'Create personalized workout plans and track your progress.',
  },
  alternates: {
    canonical: `${SITE_URL}/workout-planner`,
  },
};

export default function WorkoutPlannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Workout Planner',
            url: `${SITE_URL}/workout-planner`,
          }),
        }}
      />
      {children}
    </>
  );
}
