'use client';

import Link from 'next/link';
import { BlogPost } from '@/data/blog-posts';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
}

export default function BlogCard({ post, variant = 'default' }: BlogCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (variant === 'compact') {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-all duration-300">
          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1 group-hover:text-[#FC4C02] transition-colors">
            {post.title}
          </h3>
          <p className="text-white/40 text-xs">{formatDate(post.date)}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
          {/* Featured Image */}
          <div className="relative w-full h-56 bg-gradient-to-br from-[#FC4C02]/20 to-[#3B82F6]/20">
            {post.featuredImage ? (
              <img 
                src={post.featuredImage} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Category Badge */}
            {post.category && (
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-[#FC4C02] text-white text-xs font-bold rounded-lg">
                  {post.category}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <h2 className="text-white font-bold text-xl mb-2 line-clamp-2 group-hover:text-[#FC4C02] transition-colors">
              {post.title}
            </h2>
            
            <p className="text-white/70 text-sm mb-4 line-clamp-3">
              {post.excerpt}
            </p>

            {/* Meta Info */}
            <div className="flex items-center justify-between text-xs text-white/50 mb-4">
              <div className="flex items-center gap-2">
                {post.author?.name && <span>{post.author.name}</span>}
                {post.author?.name && <span>•</span>}
                <span>{formatDate(post.date)}</span>
              </div>
              {post.readTime && <span>{post.readTime} min read</span>}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-md border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Read More Button */}
            <button className="w-full px-4 py-2 bg-[#FC4C02] text-white rounded-xl hover:opacity-90 transition-all font-semibold text-sm">
              Read More →
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] h-full flex flex-col">
        {/* Image */}
        <div className="relative w-full h-48 bg-gradient-to-br from-[#FC4C02]/20 to-[#3B82F6]/20">
          {post.featuredImage ? (
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          
          {/* Category Badge */}
          {post.category && (
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-[#FC4C02] text-white text-xs font-bold rounded-lg">
                {post.category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h2 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-[#FC4C02] transition-colors">
            {post.title}
          </h2>
          
          <p className="text-white/70 text-sm mb-3 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-white/50 mb-3">
            <span>{formatDate(post.date)}</span>
            {post.readTime && <span>{post.readTime} min read</span>}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-md border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
