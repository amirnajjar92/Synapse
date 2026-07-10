import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training Chat',
  description: 'Unlock your fitness potential with personalized AI coaching and tailored workout plans. Elevate your journey today! - Synapse',
};

export default function TrainingChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
