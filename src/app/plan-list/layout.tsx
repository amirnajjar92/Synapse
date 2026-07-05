import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workout Plans',
  description: 'Browse and discover workout plans for every goal — muscle building, fat loss, strength, and endurance.',
};

export default function PlanListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
