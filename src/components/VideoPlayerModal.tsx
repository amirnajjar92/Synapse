'use client';

import { useEffect, useState } from 'react';
import { getTheme, loadTheme } from '@/lib/theme';

interface VideoPlayerModalProps {
  videoUrl: string;
  title: string;
  onClose: () => void;
}

export default function VideoPlayerModal({ videoUrl, title, onClose }: VideoPlayerModalProps) {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [borderRadius, setBorderRadius] = useState('40px');

  const theme = getTheme(currentTheme);

  useEffect(() => {
    setCurrentTheme(loadTheme());

    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail);
    };
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, []);

  // Adaptive border radius
  useEffect(() => {
    const updateBorderRadius = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const minDimension = Math.min(vh, vw);
      
      if (minDimension < 400) setBorderRadius('20px');
      else if (minDimension < 600) setBorderRadius('30px');
      else setBorderRadius('40px');
    };

    updateBorderRadius();
    window.addEventListener('resize', updateBorderRadius);
    return () => window.removeEventListener('resize', updateBorderRadius);
  }, []);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Extract YouTube video ID
  const getYouTubeEmbedUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      
      // Handle youtu.be short links
      if (urlObj.hostname === 'youtu.be') {
        const videoId = urlObj.pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      
      // Handle youtube.com links
      if (urlObj.hostname.includes('youtube.com')) {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
      }
      
      return url;
    } catch {
      return url;
    }
  };

  const baseWidth = 402;
  const baseHeight = 874;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div
        className="overflow-hidden shadow-2xl relative flex-shrink-0 animate-scaleIn"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh',
          borderRadius: borderRadius,
          backgroundColor: theme.colors.card,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-full flex flex-col relative">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-3 border-b"
            style={{ borderColor: theme.colors.border }}
          >
            <div className="flex-1 min-w-0 mr-2">
              <h2 
                className="text-sm font-semibold truncate"
                style={{ 
                  color: theme.colors.text,
                  fontFamily: 'var(--font-hanalei-fill)',
                }}
              >
                {title}
              </h2>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-full hover:bg-gray-700/50 transition-colors"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M18 6L6 18M6 6l12 12" 
                  stroke={theme.colors.text} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </button>
          </div>

          {/* Video Player */}
          <div className="flex-1 relative overflow-hidden">
            <iframe
              src={getYouTubeEmbedUrl(videoUrl)}
              title={title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            />
          </div>

          {/* Footer Actions */}
          <div 
            className="flex items-center justify-end gap-2 p-3 border-t"
            style={{ borderColor: theme.colors.border }}
          >
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all hover:opacity-80"
              style={{ 
                backgroundColor: theme.colors.primary,
                color: '#fff',
              }}
            >
              Open in YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
