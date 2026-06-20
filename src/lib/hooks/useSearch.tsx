'use client';

import { useState } from 'react';
import type { GoogleSearchResult, YouTubeVideo } from '@/types/search';

interface UseGoogleSearchReturn {
  results: GoogleSearchResult[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

export function useGoogleSearch(): UseGoogleSearchReturn {
  const [results, setResults] = useState<GoogleSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setError('Query is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search');
      }

      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setResults([]);
    setError(null);
  };

  return { results, isLoading, error, search, clear };
}

interface UseYouTubeSearchReturn {
  videos: YouTubeVideo[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

export function useYouTubeSearch(): UseYouTubeSearchReturn {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setError('Query is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search');
      }

      setVideos(data.videos || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setVideos([]);
    setError(null);
  };

  return { videos, isLoading, error, search, clear };
}
