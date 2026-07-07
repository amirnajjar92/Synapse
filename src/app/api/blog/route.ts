import { NextResponse } from 'next/server';
import { blogPosts } from '@/data/blog-posts';

const isDevelopment = process.env.NODE_ENV === 'development';
const FLASK_PROXY_URL = process.env.FLASK_PROXY_URL || 'https://moole-back.vercel.app';

export async function GET() {
  try {
    // In development, try Flask proxy first, then fallback to local data
    if (isDevelopment) {
      console.log('🔄 Attempting Flask proxy for MongoDB in development...');
      
      try {
        const response = await fetch(`${FLASK_PROXY_URL}/synapse/blog-posts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.posts && data.posts.length > 0) {
            console.log('✅ Successfully fetched from Flask proxy');
            return NextResponse.json(data);
          }
        }
        
        console.log('⚠️ Flask proxy failed, using local blog data');
      } catch (proxyError) {
        console.log('⚠️ Flask proxy error, using local blog data:', proxyError);
      }
      
      // Fallback to local blog posts
      return NextResponse.json({
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
        source: 'local-fallback'
      });
    }

    // In production, connect directly to MongoDB
    console.log('🔌 Connecting directly to MongoDB in production...');
    
    const { MongoClient, ServerApiVersion } = await import('mongodb');
    const uri = process.env.MONGODB_URI!;
    
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    
    const database = client.db('synapse_seo');
    const posts = database.collection('blog_posts');
    
    const allPosts = await posts
      .find({ published: true })
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();
    
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
    
    await client.close();
    
    return NextResponse.json({ 
      success: true,
      posts: cleanPosts,
      count: cleanPosts.length,
      source: 'mongodb-direct'
    });
    
  } catch (error) {
    console.error('Blog API error, falling back to local data:', error);
    
    // Final fallback to local blog posts
    return NextResponse.json({ 
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
      source: 'local-fallback',
      originalError: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
