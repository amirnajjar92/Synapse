import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training Studio for Coaches',
  description: 'Transform your coaching experience with Synapse Fit\'s training studio for seamless client management and personalized plans.',
};

export default function TrainingStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
