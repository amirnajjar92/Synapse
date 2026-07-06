import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fitness Events',
  description: 'Join the best local fitness events, competitions, and wellness activities with Synapse Fit. Connect and elevate your fitness journey.',
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
