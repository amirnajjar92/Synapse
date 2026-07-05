import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Synapse — Your AI Fitness Brain',
  description: 'AI-powered workout planning, progress tracking, and trainer collaboration. Generate personalized plans, track every rep, and get smarter every day.',
  openGraph: {
    title: 'Synapse — Your AI Fitness Brain',
    description: 'AI-powered workout planning, progress tracking, and trainer collaboration. Generate personalized plans and take your training to the next level.',
    url: `${SITE_URL}/landing`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synapse — Your AI Fitness Brain',
    description: 'AI-powered workout planning, progress tracking, and trainer collaboration.',
  },
  alternates: {
    canonical: `${SITE_URL}/landing`,
  },
};

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
