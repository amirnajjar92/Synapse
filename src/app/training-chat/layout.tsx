import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Training Chat',
  description: 'Unlock your fitness potential with personalized AI coaching and tailored workout plans. Elevate your journey today! - Synapse',
  keywords: ['training chat', 'AI coaching', 'fitness trainer', 'personal training', 'Synapse Fit'],
  openGraph: {
    title: 'Training Chat – Synapse Fit',
    description: 'Chat with AI-powered fitness trainers and get personalized coaching and workout plans.',
    url: `${SITE_URL}/training-chat`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Training Chat – Synapse Fit',
    description: 'Personalized AI coaching and workout plans through chat.',
  },
  alternates: {
    canonical: `${SITE_URL}/training-chat`,
  },
};

export default function TrainingChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Training Chat',
            url: `${SITE_URL}/training-chat`,
          }),
        }}
      />
      {children}
    </>
  );
}
