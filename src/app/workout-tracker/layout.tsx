import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Workout Tracker',
  description: 'Track workouts, monitor progress, and reach fitness goals with an intuitive tracker. Log sets, reps, and calories burned.',
  openGraph: {
    title: 'Synapse Workout Tracker – Track & Improve Fitness',
    description: 'Log your workouts, view progress, and stay motivated with Synapse Fit easy-to-use tracker.',
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
