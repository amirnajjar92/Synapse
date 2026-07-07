import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training Chat',
  description: 'Unlock tailored workout strategies with your AI fitness assistant at Synapse Fit. Transform your fitness journey today!',
};

export default function TrainingChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
