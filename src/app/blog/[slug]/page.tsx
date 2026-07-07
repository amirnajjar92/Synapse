import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { blogPosts } from '@/data/blog-posts';
import BlogPostClient from './BlogPostClient';

// Generate static params for all blog posts
export async function generateStaticParams() {
  return blogPosts
    .filter(post => post.published)
    .map((post) => ({
      slug: post.slug,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Post Not Found | Synapse Fit',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://synapse.fit';
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const ogImage = post.featuredImage || `${siteUrl}/og-image-blog.jpg`;

  return {
    title: post.metaTitle || `${post.title} | Synapse Fit Blog`,
    description: post.metaDescription || post.description,
    keywords: post.keywords || post.tags,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.description,
      url: postUrl,
      siteName: 'Synapse Fit',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post || !post.published) {
    notFound();
  }

  // JSON-LD structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.featuredImage,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Synapse Fit',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://synapse.fit'}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://synapse.fit'}/blog/${post.slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* Client Component */}
      <BlogPostClient post={post} allPosts={blogPosts} />
    </>
  );
}
