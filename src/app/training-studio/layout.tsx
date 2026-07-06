import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training Studio for Coaches',
  description: 'Simplify client management and training plans with Synapse Fit, your all-in-one dashboard for personal trainers and coaches.',
};

export default function TrainingStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
