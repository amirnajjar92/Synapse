import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/demo/', '/logotest/', '/test-anatomy/'],
      },
    ],
    sitemap: 'https://synapse-fit.vercel.app/sitemap.xml',
  };
}
