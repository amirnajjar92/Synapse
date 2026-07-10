import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workout Plans',
  description: 'Unlock your potential with tailored workout plans designed for every fitness journey. Elevate your health and transform your life today! - Synapse',
};

export default function PlanListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
