import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Synapse — Your AI Fitness Brain',
  description: 'Transform your fitness routine with AI insights and tailored workouts at Synapse Fit, your ultimate fitness companion.',
  openGraph: {
    title: 'Elevate Your Fitness with AI | Synapse Fit',
    description: 'Join Synapse Fit for personalized workouts and track your progress with AI-driven insights. Begin your fitness journey today!',
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
