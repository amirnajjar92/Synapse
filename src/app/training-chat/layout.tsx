import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training Chat',
  description: 'Unlock your fitness potential with tailored AI coaching and dynamic workout plans. Elevate your training journey today! - Synapse',
};

export default function TrainingChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
