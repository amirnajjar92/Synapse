import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Synapse — Your AI Fitness Brain',
  description: 'Transform your fitness routine with AI-enhanced workouts and insights at Synapse Fit, your partner in reaching optimal fitness levels.',
  openGraph: {
    title: 'Elevate Your Fitness with Synapse Fit',
    description: 'Unlock personalized workouts and AI insights for your best fitness journey at Synapse Fit, where technology meets wellness.',
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
