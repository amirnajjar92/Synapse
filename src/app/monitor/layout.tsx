import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Health Monitor',
  description: 'Monitor your heart health and wellness with Synapse Fit’s advanced tools for cardio training and recovery.',
};

export default function MonitorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
