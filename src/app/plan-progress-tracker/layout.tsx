import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Progress Tracker',
  description: 'Unlock your potential and track your fitness journey with precision. Elevate your progress and achieve your goals today! - Synapse',
};

export default function PlanProgressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
