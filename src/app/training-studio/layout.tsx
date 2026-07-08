import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training Studio for Coaches',
  description: 'Elevate your coaching with Synapse Fit\'s advanced training studio for efficient client management and tailored coaching solutions.'s training studio for seamless client management and personalized plans.',
};

export default function TrainingStudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
