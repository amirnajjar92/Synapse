import type { Metadata } from 'next';

const SITE_URL = 'https://synapse-fit.vercel.app';

export const metadata: Metadata = {
  title: 'Reminders | Synapse Fit',
  description: 'Manage your fitness and health reminders to stay on track with personalized notifications. Enhance your wellness journey with Synapse Fit today!',
  keywords: ['reminders', 'fitness reminders', 'health notifications', 'workout reminders', 'Synapse Fit'],
  openGraph: {
    title: 'Reminders – Synapse Fit',
    description: 'Stay on track with personalized fitness and health reminders. Enhance your wellness journey today!',
    url: `${SITE_URL}/reminders`,
    images: [{ url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reminders – Synapse Fit',
    description: 'Personalized fitness and health reminders.',
  },
  alternates: {
    canonical: `${SITE_URL}/reminders`,
  },
};

export default function RemindersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1 className="sr-only">Reminders</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Reminders',
            url: `${SITE_URL}/reminders`,
            description: 'Manage your fitness and health reminders to stay on track with personalized notifications.',
          }),
        }}
      />
      {children}
    </>
  );
}
