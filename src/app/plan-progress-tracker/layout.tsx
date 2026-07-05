import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Progress Tracker',
  description: 'Monitor your fitness journey with detailed analytics, workout history, and performance trends. See your improvement over time.',
};

export default function PlanProgressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
