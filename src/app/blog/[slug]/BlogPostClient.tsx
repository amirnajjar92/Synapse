'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/data/blog-posts';
import RelatedPosts from '../components/RelatedPosts';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';

interface BlogPostClientProps {
  post: BlogPost;
  allPosts: BlogPost[];
}

export default function BlogPostClient({ post, allPosts }: BlogPostClientProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeHeading, setActiveHeading] = useState<string>('');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Extract headings from content for table of contents
  const extractHeadings = () => {
    const headingRegex = /^##\s+(.+)$/gm;
    const headings: { id: string; text: string }[] = [];
    let match;

    while ((match = headingRegex.exec(post.content)) !== null) {
      const text = match[1];
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      headings.push({ id, text });
    }

    return headings;
  };

  const headings = extractHeadings();

  // Handle scroll spy for table of contents
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => document.getElementById(h.id));
      const scrollY = window.scrollY + 100;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (element && element.offsetTop <= scrollY) {
          setActiveHeading(headings[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = post.title;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;
    }
    setShowShareMenu(false);
  };

  // Format markdown content to HTML
  const formatContent = (content: string) => {
    return content
      // Add IDs to h2 headings
      .replace(/^## (.+)$/gm, (_, text) => {
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h2 id="${id}">${text}</h2>`;
      })
      // Format h3 headings
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      // Format bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Format lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      // Format paragraphs
      .replace(/^(?!<[h|u|l]|$)(.+)$/gm, '<p>$1</p>')
      // Format line breaks
      .replace(/\n\n/g, '\n');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <div className="fixed top-6 left-6 z-50">
        <BurgerMenuButton />
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-96 bg-gradient-to-br from-[#FC4C02]/30 to-[#3B82F6]/30">
        {post.featuredImage && (
          <img 
            src={post.featuredImage} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8">
          <div className="container mx-auto max-w-4xl">
            <Link 
              href="/blog"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
            
            <div className="mb-4">
              <span className="px-3 py-1 bg-[#FC4C02] text-white text-xs font-bold rounded-lg">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-xs font-bold">{post.author.name[0]}</span>
                </div>
                <span>{post.author.name}</span>
              </div>
              <span>•</span>
              <span>{formatDate(post.date)}</span>
              <span>•</span>
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar - Table of Contents (Desktop) */}
            {headings.length > 0 && (
              <div className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Table of Contents</h3>
                  <nav className="space-y-2">
                    {headings.map(heading => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-sm transition-colors ${
                          activeHeading === heading.id
                            ? 'text-[#FC4C02] font-semibold'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className={`${headings.length > 0 ? 'lg:col-span-6' : 'lg:col-span-9'}`}>
              <article className="prose prose-invert prose-lg max-w-none">
                <div 
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
                />
              </article>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="px-3 py-1.5 bg-white/5 text-white/70 text-sm rounded-lg border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Author Bio */}
              {post.author.bio && (
                <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FC4C02] to-[#3B82F6] flex items-center justify-center text-2xl font-bold flex-shrink-0">
                      {post.author.name[0]}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">{post.author.name}</h3>
                      <p className="text-white/70 text-sm">{post.author.bio}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Posts */}
              <RelatedPosts currentPost={post} allPosts={allPosts} />
            </div>

            {/* Sidebar - Share & CTA (Desktop) */}
            <div className="lg:col-span-3">
              <div className="sticky top-24 space-y-6">
                {/* Share Buttons */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">Share</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full px-3 py-2 bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 text-white rounded-lg hover:bg-[#1DA1F2]/20 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      Twitter
                    </button>
                    
                    <button
                      onClick={() => handleShare('facebook')}
                      className="w-full px-3 py-2 bg-[#1877F2]/10 border border-[#1877F2]/30 text-white rounded-lg hover:bg-[#1877F2]/20 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </button>
                    
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full px-3 py-2 bg-[#0A66C2]/10 border border-[#0A66C2]/30 text-white rounded-lg hover:bg-[#0A66C2]/20 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </button>
                    
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-br from-[#FC4C02] to-[#3B82F6] rounded-2xl p-6">
                  <h3 className="text-white font-bold text-lg mb-2">Try Synapse Fit</h3>
                  <p className="text-white/90 text-sm mb-4">
                    Experience AI-powered fitness coaching and reach your goals faster
                  </p>
                  <Link
                    href="/landing"
                    className="block w-full px-4 py-2 bg-white text-[#0a0a0a] rounded-xl hover:opacity-90 transition-all font-semibold text-sm text-center"
                  >
                    Get Started →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Navigation */}
      <FloatingNavBar />

      {/* Custom Styles for Blog Content */}
      <style jsx global>{`
        .blog-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: white;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          scroll-margin-top: 100px;
        }
        
        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .blog-content p {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.8;
          margin-bottom: 1.25rem;
          font-size: 1.0625rem;
        }
        
        .blog-content strong {
          color: white;
          font-weight: 600;
        }
        
        .blog-content ul {
          list-style: none;
          margin: 1.5rem 0;
          padding-left: 0;
        }
        
        .blog-content li {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
          position: relative;
          line-height: 1.7;
        }
        
        .blog-content li:before {
          content: "→";
          position: absolute;
          left: 0;
          color: #FC4C02;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
