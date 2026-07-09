import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training Chat',
  description: 'Unlock your potential with personalized training chat solutions that elevate your fitness journey. Transform your workouts today! - Synapse's AI fitness assistant. Elevate your fitness game today!',
};

export default function TrainingChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
