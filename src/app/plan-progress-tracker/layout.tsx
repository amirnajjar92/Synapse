import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Progress Tracker',
  description: 'Monitor your fitness progress with real-time analytics and insights using Synapse Fit. Start optimizing your workouts today!'s detailed progress analytics and workout history. See your improvements over time.',
};

export default function PlanProgressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
