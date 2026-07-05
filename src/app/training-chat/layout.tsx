import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training Chat',
  description: 'Chat with your AI fitness assistant for real-time workout advice, form tips, and training adjustments during your sessions.',
};

export default function TrainingChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
