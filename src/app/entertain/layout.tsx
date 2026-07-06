import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fitness Entertainment',
  description: 'Stay inspired with the latest fitness news, workout videos, and local events. Elevate your fitness journey with Synapse Fit.',
};

export default function EntertainLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
