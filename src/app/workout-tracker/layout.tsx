import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Workout Tracker',
  description: 'Effortlessly track your workouts and progress to achieve your fitness goals with Synapse Fit\'s intuitive tracker.',
  openGraph: {
    title: 'Workout Tracker | Synapse Fit',
    description: 'Track workouts, monitor your fitness journey, and achieve goals with Synapse Fit\'s easy-to-use tracker.',
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
  return <>{children}</>;
}
