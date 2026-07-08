import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Training Plans',
  description: 'Unlock your potential with personalized AI-driven training plans at Synapse Fit. Transform your fitness journey today!',
};

export default function MyPlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
