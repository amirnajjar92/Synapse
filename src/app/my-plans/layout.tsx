import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Training Plans',
  description: 'Unlock your potential with personalized AI-driven training plans designed for your fitness goals. Transform your journey with Synapse.',
};

export default function MyPlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
