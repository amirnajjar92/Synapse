import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fitness Events',
  description: 'Find local fitness events, competitions, marathons, and wellness activities near you. Stay connected with the fitness community.',
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
