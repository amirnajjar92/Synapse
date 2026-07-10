import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Progress Tracker',
  description: 'Unlock your fitness potential with our interactive Progress Tracker. Elevate your workout experience and monitor your progress today! - Synapse',
};

export default function PlanProgressLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
