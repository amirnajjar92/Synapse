import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { blogPosts } from '@/data/blog-posts';
import BlogPostClient from './BlogPostClient';

interface ApiPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  keywords: string[];
  url: string;
  featuredImage?: string;
  image?: string;
  og_image?: string;
  createdAt: string;
  publishedAt: string;
}

async function fetchAllPosts(): Promise<ApiPost[]> {
  try {
    const h = await headers();
    const host = h.get('host');
    const protocol = h.get('x-forwarded-proto') || 'https';
    const origin = host
      ? `${protocol}://${host}`
      : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    const res = await fetch(`${origin}/api/blog`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && Array.isArray(data.posts)) {
      return data.posts;
    }
  } catch (e) {
    console.error('Failed to fetch blog posts for [slug] page:', e);
  }
  return [];
}

function getAuthorName(slug: string): string {
  const post = blogPosts.find(p => p.slug === slug);
  return post?.author?.name || 'Synapse Fit';
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const allPosts = await fetchAllPosts();
  const post = allPosts.find(p => p.url.split('/').filter(Boolean).pop() === slug);

  if (!post) {
    return { title: 'Post Not Found | Synapse Fit' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://synapse.fit';
  const postUrl = `${siteUrl}/blog/${slug}`;
  const ogImage = post.og_image || post.featuredImage || `${siteUrl}/og-image-blog.jpg`;
  const authorName = getAuthorName(slug);

  return {
    title: `${post.title} | Synapse Fit Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    authors: [{ name: authorName }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: 'Synapse Fit',
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      type: 'article',
      publishedTime: post.publishedAt || post.createdAt,
      tags: post.keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
    alternates: { canonical: postUrl },
    other: {
      'author': authorName,
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const allPosts = await fetchAllPosts();
  const apiPost = allPosts.find(p => p.url.split('/').filter(Boolean).pop() === slug);

  if (!apiPost) {
    notFound();
  }

  const post = {
    id: apiPost.id,
    slug,
    title: apiPost.title,
    content: apiPost.content,
    excerpt: apiPost.excerpt,
    tags: apiPost.keywords,
    description: apiPost.excerpt,
    date: apiPost.publishedAt || apiPost.createdAt,
    featuredImage: apiPost.featuredImage,
    url: apiPost.url,
    image: apiPost.image,
    og_image: apiPost.og_image,
    publishedAt: apiPost.publishedAt,
    createdAt: apiPost.createdAt,
    published: true,
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://synapse.fit';
  const authorName = getAuthorName(slug);
  const otherPosts = blogPosts.filter(p => p.slug !== slug && p.published);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            image: post.featuredImage,
            datePublished: post.date,
            author: {
              '@type': 'Person',
              name: authorName,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Synapse Fit',
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/icons/icon-512x512.png`,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${siteUrl}/blog/${post.slug}`,
            },
          }),
        }}
      />
      <nav className="sr-only" aria-label="Related blog posts">
        <a href="/blog">Back to Blog</a>
        {otherPosts.map(p => (
          <a key={p.slug} href={`/blog/${p.slug}`}>{p.title}</a>
        ))}
      </nav>
      <BlogPostClient post={post} />
    </>
  );
}
