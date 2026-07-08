'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { BlogPostAPIResponse } from '@/data/blog-posts';

type Posts = BlogPostAPIResponse['posts'];

interface BlogStoreContext {
  posts: Posts;
  setPosts: (posts: Posts) => void;
  hasLoaded: boolean;
  setHasLoaded: (v: boolean) => void;
}

const BlogStoreCtx = createContext<BlogStoreContext | null>(null);

export function BlogStoreProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Posts>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  return (
    <BlogStoreCtx.Provider value={{ posts, setPosts, hasLoaded, setHasLoaded }}>
      {children}
    </BlogStoreCtx.Provider>
  );
}

export function useBlogStore() {
  const ctx = useContext(BlogStoreCtx);
  if (!ctx) throw new Error('useBlogStore must be used inside BlogStoreProvider');
  return ctx;
}
