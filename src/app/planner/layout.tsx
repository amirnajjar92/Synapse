import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Workout Planner',
  description: 'Transform your fitness journey with Synapse Fit\'s AI Workout Planner. Get personalized training plans tailored just for you.',
};

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
