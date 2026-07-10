import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://synapse-fit.vercel.app';
  const now = new Date().toISOString().split('T')[0];

  return [
    { url: base, lastModified: now, changeFrequency: 'monthly' as const, priority: 1 },
    { url: `${base}/landing`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${base}/planner`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${base}/workout-planner`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${base}/workout-tracker`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/training-studio`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${base}/training-chat`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${base}/my-plans`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${base}/plan-list`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${base}/plan-progress-tracker`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${base}/water-tracker`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: `${base}/entertain`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: `${base}/events`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: `${base}/monitor`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: `${base}/musclemap`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${base}/reminders`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 },
  ];
}
