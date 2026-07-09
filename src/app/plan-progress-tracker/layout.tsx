import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Progress Tracker',
  description: 'Unlock your fitness journey with our Progress Tracker. Achieve real-time insights and elevate your workouts for maximum results - Synapse',
};

export default function PlanProgressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
