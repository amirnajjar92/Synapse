import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workout Plans',
  description: 'Unlock your potential with personalized workout plans designed to elevate your fitness journey. Transform your results with Synapse.',
};

export default function PlanListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
