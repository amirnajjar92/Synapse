'use client';

import { useEffect } from 'react';

interface VideoPlayerModalProps {
  videoUrl: string;
  title: string;
  onClose: () => void;
}

export default function VideoPlayerModal({ videoUrl, title, onClose }: VideoPlayerModalProps) {
  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const getYouTubeEmbedUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams({ autoplay: '1', mute: '1', playsinline: '1' });

      if (urlObj.hostname === 'youtu.be') {
        const videoId = urlObj.pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
      }

      if (urlObj.hostname.includes('youtube.com')) {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
        }
      }

      return url;
    } catch {
      return url;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(24px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[402px] overflow-hidden animate-scaleIn"
        style={{ borderRadius: '40px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video Player */}
        <div className="relative" style={{ aspectRatio: '402 / 680' }}>
          <iframe
            src={getYouTubeEmbedUrl(videoUrl)}
            title={title}
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none', borderRadius: '40px 40px 0 0' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

          {/* Close button overlaid */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: 'rgba(11, 11, 11, 0.9)', borderRadius: '0 0 40px 40px' }}
        >
          <h2
            className="text-sm font-semibold truncate flex-1 min-w-0 mr-2"
            style={{ fontFamily: 'var(--font-hanalei-fill)', color: '#e5e5e5' }}
          >
            {title}
          </h2>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#a3a3a3' }}
          >
            YouTube
          </a>
        </div>
      </div>
    </div>
  );
}
