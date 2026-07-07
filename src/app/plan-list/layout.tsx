import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workout Plans',
  description: 'Discover personalized workout plans for muscle gain, fat loss, and endurance at Synapse Fit. Transform your fitness journey today!',
};

export default function PlanListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
