import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Workout Planner',
  description: 'Achieve your fitness goals with our AI Workout Planner. Get a custom training plan designed for you at Synapse Fit.',
};

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
