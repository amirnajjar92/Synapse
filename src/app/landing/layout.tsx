import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Synapse — Your AI Fitness Brain',
  description: 'Elevate your fitness journey with AI-driven plans and tracking at Synapse Fit. Get personalized workouts and train smarter today.',
  openGraph: {
    title: 'Transform Your Fitness with AI | Synapse Fit',
    description: 'Discover AI-powered workout plans and progress tracking. Join Synapse Fit to personalize your fitness experience.',
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
