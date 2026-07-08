import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Workout Planner',
  description: "Unlock your potential with Synapse Fit's personalized AI Workout Planner – tailored training plans for your unique fitness goals.",
};

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
