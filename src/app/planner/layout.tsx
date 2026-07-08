import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Workout Planner',
  description: 'Unlock your potential with Synapse Fit\'s personalized AI Workout Planner – tailored training plans for your unique fitness goals.'s AI Workout Planner. Get personalized training plans tailored just for you.',
};

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
