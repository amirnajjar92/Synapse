import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Training Plans',
  description: 'Discover personalized AI-driven training plans at Synapse Fit, designed to help you achieve your fitness goals effortlessly.',
};

export default function MyPlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
