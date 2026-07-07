import { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';

export const metadata: Metadata = {
  title: 'Blog - Synapse Fit | AI Fitness Insights & Training Tips',
  description: 'Expert fitness advice, AI-powered training insights, workout tips, and health guides from Synapse Fit. Learn from the best to reach your fitness goals faster.',
  keywords: ['fitness blog', 'ai fitness', 'workout tips', 'training advice', 'health guides', 'personal training', 'workout planning'],
  openGraph: {
    title: 'Synapse Fit Blog - AI Fitness Insights & Training Tips',
    description: 'Expert fitness advice, AI-powered training insights, workout tips, and health guides from Synapse Fit.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://synapse.fit'}/blog`,
    siteName: 'Synapse Fit',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://synapse.fit'}/og-image-blog.jpg`,
        width: 1200,
        height: 630,
        alt: 'Synapse Fit Blog',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synapse Fit Blog - AI Fitness Insights & Training Tips',
    description: 'Expert fitness advice, AI-powered training insights, workout tips, and health guides.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://synapse.fit'}/og-image-blog.jpg`],
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://synapse.fit'}/blog`,
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}

