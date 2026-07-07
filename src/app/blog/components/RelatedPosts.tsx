'use client';

import { BlogPost } from '@/data/blog-posts';
import BlogCard from './BlogCard';

interface RelatedPostsProps {
  currentPost: BlogPost;
  allPosts: BlogPost[];
  maxPosts?: number;
}

export default function RelatedPosts({ currentPost, allPosts, maxPosts = 3 }: RelatedPostsProps) {
  // Find related posts by matching tags or category
  const relatedPosts = allPosts
    .filter(post => 
      post.slug !== currentPost.slug && 
      post.published &&
      (post.tags.some(tag => currentPost.tags.includes(tag)) || post.category === currentPost.category)
    )
    .slice(0, maxPosts);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map(post => (
          <BlogCard key={post.slug} post={post} variant="compact" />
        ))}
      </div>
    </div>
  );
}
