'use client';

import { useState, useMemo, useEffect } from 'react';
import { BlogPost, BlogPostAPIResponse } from '@/data/blog-posts';
import BlogHeader from './components/BlogHeader';
import BlogTags from './components/BlogTags';
import BlogCard from './components/BlogCard';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';

export default function BlogPageClient() {
  const [posts, setPosts] = useState<BlogPostAPIResponse['posts']>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then((data: BlogPostAPIResponse) => {
        console.log('Fetched blog posts:', data);
        if (data.success && data.posts) {
          setPosts(data.posts);
        }
      })
      .catch(err => console.error('Failed to fetch blog posts:', err))
      .finally(() => setLoading(false));
  }, []);

  // Map API posts to include a derived slug and normalized fields
  const normalizedPosts = useMemo(() => posts.map(post => ({
    ...post,
    slug: post.url.split('/').filter(Boolean).pop() || post.id,
    tags: post.keywords,
    description: post.excerpt,
    date: post.publishedAt || post.createdAt,
    published: true,
  } as BlogPost)), [posts]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    normalizedPosts.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [normalizedPosts]);

  // Filter posts by tag and search query
  const filteredPosts = useMemo(() => {
    return normalizedPosts
      .filter(post => {
        if (selectedTag && !post.tags.includes(selectedTag)) {
          return false;
        }
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            post.title.toLowerCase().includes(query) ||
            post.excerpt.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedTag, searchQuery, normalizedPosts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-white/60 text-lg">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <div className="fixed top-6 left-6 z-50">
        <BurgerMenuButton />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-32">
        {/* Header */}
        <BlogHeader onSearch={setSearchQuery} showSearch />

        {/* Tag Filters */}
        <BlogTags 
          tags={allTags} 
          selectedTag={selectedTag} 
          onTagSelect={setSelectedTag} 
        />

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredPosts.map(post => (
              <BlogCard key={post.id} post={post} variant="default" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg 
              className="w-16 h-16 text-white/20 mx-auto mb-4"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white/60 text-lg">No articles found</p>
            <p className="text-white/40 text-sm mt-2">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Results Count */}
        {filteredPosts.length > 0 && (
          <div className="mt-8 text-center text-white/40 text-sm">
            Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
            {selectedTag && ` in "${selectedTag}"`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </div>

      {/* Floating Navigation */}
      <FloatingNavBar />
    </div>
  );
}
