import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Progress Tracker',
  description: 'Monitor your fitness journey with real-time analytics and insights using Synapse Fit. Optimize workouts and track improvements today.',
};

export default function PlanProgressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
