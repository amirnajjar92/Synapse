import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Progress Tracker',
  description: 'Unlock the power of your fitness journey with real-time progress tracking and insights. Achieve your goals with Synapse.',
};

export default function PlanProgressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
