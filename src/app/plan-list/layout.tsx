import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workout Plans',
  description: 'Explore tailored workout plans for muscle building, fat loss, strength, and endurance at Synapse Fit.',
};

export default function PlanListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
