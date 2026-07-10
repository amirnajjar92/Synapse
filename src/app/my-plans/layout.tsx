import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Training Plans',
  description: 'Unlock your potential with tailored AI-driven training plans that elevate your fitness journey! Transform your workouts today - Synapse',
};

export default function MyPlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
