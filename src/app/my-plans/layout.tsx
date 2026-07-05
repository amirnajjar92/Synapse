import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Training Plans',
  description: 'View and manage your personalized AI-generated training plans. Track progress, modify workouts, and stay on schedule.',
};

export default function MyPlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
