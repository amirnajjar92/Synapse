import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Synapse — Your AI Fitness Brain',
  description: 'AI-powered workout planning, progress tracking, and trainer collaboration. Generate personalized plans, track every rep, and get smarter every day.',
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
