import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training Chat',
  description: 'Get personalized workout tips and training adjustments with your AI fitness assistant. Elevate your fitness journey with Synapse Fit.',
};

export default function TrainingChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
