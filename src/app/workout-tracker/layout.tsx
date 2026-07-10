import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Workout Tracker',
  description: "Track your workouts and see progress easily with Synapse Fit's powerful tracker.",
  keywords: ['workout tracker', 'fitness', 'exercise logs', 'workout logging', 'Synapse Fit'],
  openGraph: {
    title: 'Transform Your Workouts with Synapse',
    description: "Effortlessly monitor your fitness journey with Synapse Fit's intuitive workout tracker.",
    url: `${SITE_URL}/workout-tracker`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synapse Workout Tracker',
    description: 'Track your workouts and monitor your fitness progress.',
  },
  alternates: {
    canonical: `${SITE_URL}/workout-tracker`,
  },
};

export default function WorkoutTrackerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="sr-only">Workout Tracker</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Workout Tracker',
            url: `${SITE_URL}/workout-tracker`,
            description: 'Track your workouts and progress with our Workout Tracker.',
          }),
        }}
      />
      {children}
    </>
  );
}
