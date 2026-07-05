import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://synapse-fit.vercel.app';

  return [
    { url: base, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/landing`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/planner`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/workout-planner`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/workout-tracker`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/training-studio`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/training-chat`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/my-plans`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/plan-list`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/plan-progress-tracker`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/water-tracker`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/entertain`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/events`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/monitor`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/musclemap`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/reminders`, changeFrequency: 'monthly', priority: 0.4 },
  ];
}
