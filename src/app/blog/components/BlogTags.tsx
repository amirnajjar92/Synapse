'use client';

interface BlogTagsProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export default function BlogTags({ tags, selectedTag, onTagSelect }: BlogTagsProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 justify-center">
        {/* All Posts */}
        <button
          onClick={() => onTagSelect(null)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            selectedTag === null
              ? 'bg-[#FC4C02] text-white'
              : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          All Posts
        </button>

        {/* Tag Filters */}
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => onTagSelect(tag)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedTag === tag
                ? 'bg-[#FC4C02] text-white'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
