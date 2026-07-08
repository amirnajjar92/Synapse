import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Workout Plans',
  description: 'Explore tailored workout plans for every fitness goal at Synapse Fit. Achieve your transformation today with expert guidance!',
};

export default function PlanListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
