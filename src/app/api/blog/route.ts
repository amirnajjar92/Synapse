import { NextResponse } from 'next/server';
import { blogPosts } from '@/data/blog-posts';

const FLASK_PROXY_URL = process.env.FLASK_PROXY_URL || 'https://moole-back.vercel.app';

function localFallback() {
  return {
    success: true,
    posts: blogPosts.map(post => ({
      id: post.slug,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      keywords: post.keywords || post.tags,
      url: `/blog/${post.slug}`,
      featuredImage: post.featuredImage,
      image: post.image,
      og_image: post.og_image,
      createdAt: post.date,
      publishedAt: post.date,
    })),
    count: blogPosts.length,
    source: 'local-fallback' as const,
  };
}

export async function GET() {
  // 1. Try Flask proxy (source of truth for blog posts)
  try {
    console.log('🔄 Attempting Flask proxy for blog posts...');
    const response = await fetch(`${FLASK_PROXY_URL}/synapse/blog-posts`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.posts && data.posts.length > 0) {
        console.log('✅ Successfully fetched from Flask proxy');
        const mapped = {
          ...data,
          posts: data.posts.map((p: any) => ({
            ...p,
            featuredImage: p.featuredImage || p.featured_image,
            featured_image: undefined,
          })),
        };
        return NextResponse.json(mapped);
      }
    }
    console.log('⚠️ Flask proxy returned no posts');
  } catch (proxyError) {
    console.log('⚠️ Flask proxy error:', proxyError);
  }

  // 2. Try MongoDB (production DB)
  try {
    console.log('🔌 Connecting to MongoDB...');
    const { MongoClient, ServerApiVersion } = await import('mongodb');
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log('⚠️ MONGODB_URI not set, skipping MongoDB');
    } else {
      const client = new MongoClient(uri, {
        serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
      });

      await client.connect();
      await client.db('admin').command({ ping: 1 });

      const database = client.db('synapse_seo');
      const posts = database.collection('blog_posts');

      const allPosts = await posts
        .find({ published: true })
        .sort({ created_at: -1 })
        .limit(50)
        .toArray();

      await client.close();

      if (allPosts.length > 0) {
        const cleanPosts = allPosts.map(post => ({
          id: post._id.toString(),
          title: post.title,
          content: post.content,
          excerpt: post.meta_description || post.excerpt,
          keywords: post.keywords,
          url: post.url,
          featuredImage: post.featured_image || post.featuredImage,
          image: post.image,
          og_image: post.og_image,
          createdAt: post.created_at,
          publishedAt: post.published_at,
        }));

        console.log('✅ Successfully fetched from MongoDB');
        return NextResponse.json({
          success: true,
          posts: cleanPosts,
          count: cleanPosts.length,
          source: 'mongodb-direct',
        });
      }
      console.log('⚠️ MongoDB returned no posts');
    }
  } catch (error) {
    console.error('⚠️ MongoDB error:', error);
  }

  // 3. Final fallback to local blog posts
  console.log('📦 Using local fallback blog data');
  return NextResponse.json(localFallback());
}
