import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training Studio for Coaches',
  description: 'Manage clients, create training plans, and monitor progress from a single dashboard. Built for personal trainers and coaches.',
};

export default function TrainingStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
