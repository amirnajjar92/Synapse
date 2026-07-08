import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Progress Tracker',
  description: 'Track your fitness progress with real-time insights and analytics. Optimize your workouts and see improvements with Synapse Fit.',
};

export default function PlanProgressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
