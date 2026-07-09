import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training Chat',
  description: 'Unlock personalized fitness coaching with AI-driven workout plans at Synapse Fit. Transform your workouts today!'s AI fitness assistant. Elevate your fitness game today!',
};

export default function TrainingChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
