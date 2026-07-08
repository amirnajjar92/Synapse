'use client';

import { useState } from 'react';

interface BlogHeaderProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

export default function BlogHeader({ onSearch, showSearch = true }: BlogHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="mb-8">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-[#F5F0EB] mb-3">
          Synapse <span className="text-[#EF0606]">Blog</span>
        </h1>
        <p className="text-[#F5F0EB]/60 text-base md:text-lg max-w-2xl mx-auto">
          Expert fitness insights, AI-powered training tips, and health guides to help you reach your goals
        </p>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full px-4 py-3 pl-12 bg-[#F5F0EB]/5 border border-[#F5F0EB]/10 rounded-xl text-[#F5F0EB] placeholder-[#F5F0EB]/40 focus:outline-none focus:ring-2 focus:ring-[#EF0606] focus:border-transparent transition-all"
            />
            <svg 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F5F0EB]/40"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  if (onSearch) onSearch('');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F5F0EB]/40 hover:text-[#F5F0EB] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
