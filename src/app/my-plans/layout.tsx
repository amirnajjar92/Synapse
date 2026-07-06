import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Training Plans',
  description: 'Discover personalized AI-generated training plans at Synapse Fit. Stay on track and achieve your fitness goals with ease.',
};

export default function MyPlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
