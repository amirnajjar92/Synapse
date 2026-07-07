'use client';

import { useState, useRef, useEffect } from 'react';

interface BlogTagsProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export default function BlogTags({ tags, selectedTag, onTagSelect }: BlogTagsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const label = selectedTag || 'All Posts';

  return (
    <div ref={ref} className="relative w-full sm:w-auto">
      <button
        onClick={() => setOpen(!open)}
        className="w-full sm:w-48 flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white hover:bg-white/10 transition-all"
      >
        <svg className="w-4 h-4 shrink-0 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="flex-1 text-left truncate">{label}</span>
        <svg className={`w-3.5 h-3.5 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 sm:right-auto mt-1 z-50 w-full sm:w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <button
            onClick={() => { onTagSelect(null); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              selectedTag === null
                ? 'text-[#FC4C02] font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            All Posts
          </button>
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => { onTagSelect(tag); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                selectedTag === tag
                  ? 'text-[#FC4C02] font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
