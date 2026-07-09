import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Training Plans',
  description: 'Unlock personalized training plans designed to elevate your fitness journey. Discover your path to success with tailored strategies - Synapse',
};

export default function MyPlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
