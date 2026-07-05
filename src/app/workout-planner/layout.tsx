import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Workout Planner',
  description: 'Create personalized workout plans, track progress, and achieve goals with our intuitive planner. Set targets, log sessions, and stay motivated.',
  openGraph: {
    title: 'Synapse Workout Planner - Create & Track Your Fitness Goals',
    description: 'Design custom workout routines, log your sessions, and monitor progress in real time with Synapse Fit.',
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
  return <>{children}</>;
}
