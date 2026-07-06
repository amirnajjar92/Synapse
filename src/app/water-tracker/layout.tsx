import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Water Intake Tracker',
  description: 'Monitor your daily water consumption and improve your hydration with Synapse Fit\'s innovative water tracker.',
};

export default function WaterTrackerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
