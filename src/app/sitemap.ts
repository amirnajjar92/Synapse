import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://synapse-fit.vercel.app';
  const now = new Date().toISOString().split('T')[0];

  const staticPages = [
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

  // Fetch blog post slugs from the blog API
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${base}/api/blog`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const posts = Array.isArray(data) ? data : data.posts ?? data.articles ?? [];
      blogPosts = posts.map((post: { slug?: string; _id?: string; updatedAt?: string; createdAt?: string }) => ({
        url: `${base}/blog/${post.slug || post._id}`,
        lastModified: post.updatedAt?.split('T')[0] || post.createdAt?.split('T')[0] || now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch {
    // API unavailable at build time — skip blog posts
  }

  return [...staticPages, ...blogPosts];
}
