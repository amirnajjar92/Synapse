'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import WebViewModal from '@/components/WebViewModal';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import type { GoogleSearchResult, YouTubeVideo } from '@/types/search';

type Category = 'news' | 'events' | 'videos' | 'playlists';

interface Plan {
  id: string;
  title: string;
  prompt: string;
  status: string;
}

interface GridCell {
  type: Category;
  data: GoogleSearchResult | YouTubeVideo;
  colSpan: number;
  rowSpan: number;
  color: string;
}

const Spinner = ({ size = 32 }: { size?: number }) => (
  <div className="flex items-center justify-center">
    <div
      className="rounded-full border border-white/20 animate-spin"
      style={{ width: size, height: size, borderTopColor: 'white', borderWidth: '2px' }}
    />
  </div>
);

export default function EntertainPage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Data states
  const [newsResults, setNewsResults] = useState<GoogleSearchResult[]>([]);
  const [eventsResults, setEventsResults] = useState<GoogleSearchResult[]>([]);
  const [videosResults, setVideosResults] = useState<YouTubeVideo[]>([]);
  const [playlistsResults, setPlaylistsResults] = useState<YouTubeVideo[]>([]);
  
  // Grid states
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [page, setPage] = useState(1);
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<{ url: string; title: string } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);

  const theme = { colors: { background: '#151515', card: '#000', text: '#fff', textSecondary: '#9ca3af', textMuted: '#6b7280', border: '#374151', primary: '#fff' } };

  // Bootstrap
  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('synapse_user');
    if (!userStr) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userStr));
  }, [router]);

  // Calculate perfect grid layout
  const calculateGridLayout = useCallback((
    news: GoogleSearchResult[],
    events: GoogleSearchResult[],
    videos: YouTubeVideo[],
    playlists: YouTubeVideo[]
  ): GridCell[] => {
    const cells: GridCell[] = [];
    const COLS = 2;
    const grid: boolean[][] = Array(100).fill(null).map(() => Array(COLS).fill(false));
    
    // Helper to find next available position
    const findNextPosition = (colSpan: number, rowSpan: number): [number, number] | null => {
      for (let row = 0; row < grid.length - rowSpan + 1; row++) {
        for (let col = 0; col < COLS - colSpan + 1; col++) {
          let canPlace = true;
          for (let r = row; r < row + rowSpan; r++) {
            for (let c = col; c < col + colSpan; c++) {
              if (grid[r][c]) {
                canPlace = false;
                break;
              }
            }
            if (!canPlace) break;
          }
          if (canPlace) return [row, col];
        }
      }
      return null;
    };
    
    // Mark cells as occupied
    const occupyCells = (row: number, col: number, colSpan: number, rowSpan: number) => {
      for (let r = row; r < row + rowSpan; r++) {
        for (let c = col; c < col + colSpan; c++) {
          grid[r][c] = true;
        }
      }
    };
    
    // Define content distribution pattern (Instagram Explore style)
    const pattern = [
      // Pinterest-style varied layout (2 columns)
      { type: 'videos' as const, colSpan: 1, rowSpan: 2 },
      { type: 'news' as const, colSpan: 1, rowSpan: 1 },
      { type: 'playlists' as const, colSpan: 1, rowSpan: 1 },
      { type: 'videos' as const, colSpan: 1, rowSpan: 1 },
      { type: 'videos' as const, colSpan: 2, rowSpan: 1 },
      { type: 'events' as const, colSpan: 1, rowSpan: 1 },
      { type: 'playlists' as const, colSpan: 1, rowSpan: 1 },
      { type: 'videos' as const, colSpan: 1, rowSpan: 1 },
      { type: 'news' as const, colSpan: 1, rowSpan: 2 },
      { type: 'playlists' as const, colSpan: 1, rowSpan: 1 },
      { type: 'videos' as const, colSpan: 2, rowSpan: 1 },
      { type: 'events' as const, colSpan: 1, rowSpan: 1 },
      { type: 'videos' as const, colSpan: 1, rowSpan: 1 },
      { type: 'playlists' as const, colSpan: 1, rowSpan: 2 },
      { type: 'news' as const, colSpan: 1, rowSpan: 1 },
      { type: 'videos' as const, colSpan: 1, rowSpan: 1 },
      { type: 'events' as const, colSpan: 1, rowSpan: 1 },
      { type: 'playlists' as const, colSpan: 1, rowSpan: 1 },
    ];
    
    // Create content pools
    const contentPools = {
      news: [...news],
      events: [...events],
      videos: [...videos],
      playlists: [...playlists],
    };
    
    const colors = {
      news: 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.08))',
      events: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(59,130,246,0.08))',
      videos: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(168,85,247,0.08))',
      playlists: 'linear-gradient(135deg, rgba(236,72,153,0.25), rgba(236,72,153,0.08))',
    };
    
    // Fill grid according to pattern
    let patternIndex = 0;
    let attempts = 0;
    const maxAttempts = 200;
    
    while (cells.length < 30 && attempts < maxAttempts) {
      attempts++;
      const patternItem = pattern[patternIndex % pattern.length];
      patternIndex++;
      
      // Get content from pool
      const pool = contentPools[patternItem.type];
      if (pool.length === 0) {
        // Recycle content if pool is empty
        if (patternItem.type === 'videos' && videos.length > 0) {
          pool.push(...videos as any[]);
        } else if (patternItem.type === 'playlists' && playlists.length > 0) {
          pool.push(...playlists as any[]);
        } else if (patternItem.type === 'news' && news.length > 0) {
          pool.push(...news as any[]);
        } else if (patternItem.type === 'events' && events.length > 0) {
          pool.push(...events as any[]);
        } else {
          continue;
        }
      }
      
      const content = pool.shift();
      if (!content) continue;
      
      // Find position
      const position = findNextPosition(patternItem.colSpan, patternItem.rowSpan);
      if (!position) {
        // Try with smaller size
        const smallPosition = findNextPosition(1, 1);
        if (!smallPosition) break;
        
        occupyCells(smallPosition[0], smallPosition[1], 1, 1);
        cells.push({
          type: patternItem.type,
          data: content,
          colSpan: 1,
          rowSpan: 1,
          color: colors[patternItem.type],
        });
      } else {
        occupyCells(position[0], position[1], patternItem.colSpan, patternItem.rowSpan);
        cells.push({
          type: patternItem.type,
          data: content,
          colSpan: patternItem.colSpan,
          rowSpan: patternItem.rowSpan,
          color: colors[patternItem.type],
        });
      }
    }
    
    return cells;
  }, []);

  // Generate grid from current data
  useEffect(() => {
    if (newsResults.length > 0 || videosResults.length > 0) {
      const newCells = calculateGridLayout(
        newsResults,
        eventsResults,
        videosResults,
        playlistsResults
      );
      setGridCells(newCells);
    }
  }, [newsResults, eventsResults, videosResults, playlistsResults, calculateGridLayout]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || isLoadingMore || !hasMoreContent || selectedCategory) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Load more when 80% scrolled
    if (scrollPercentage > 0.8) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    }
  }, [isLoadingMore, hasMoreContent, selectedCategory]);

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const fetchActivePlan = useCallback(async () => {
    if (!user?.email) return;
    try {
      const res = await fetch('/api/users/me/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      if (res.ok) {
        const data = await res.json();
        const plans: Plan[] = data.plans || [];
        const active = plans.find((p) => p.status === 'IN_PROGRESS') || plans[0] || null;
        setActivePlan(active);
      }
    } catch (e) {
      console.error('Error fetching plans:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchActivePlan();
  }, [fetchActivePlan]);

  // Fetch category data
  const fetchCategoryData = useCallback(async (category: Category, append: boolean = false) => {
    if (!activePlan) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      let searchQuery = '';
      
      // Generate AI search query based on category
      const aiPrompts = {
        news: `Based on this fitness plan: "${activePlan.prompt}", generate a concise Google search query (4-6 words) to find the most popular and trending fitness news, health articles, and sport news. Prioritize well-known sources and recent viral content. Only return the search query.`,
        events: `Based on this fitness plan: "${activePlan.prompt}", generate a concise Google search query (4-6 words) to find top upcoming fitness events, running races, CrossFit competitions, and marathons. Prioritize major events and popular competitions. Only return the search query.`,
        videos: `Based on this fitness plan: "${activePlan.prompt}", generate a concise YouTube search query (4-6 words) to find the most viewed and highest quality workout videos, training tutorials, and fitness guides. Prioritize popular creators with millions of views. Only return the search query.`,
        playlists: `Based on this fitness plan: "${activePlan.prompt}", generate a concise YouTube search query (4-6 words) to find the most popular workout playlists, fitness music mixes, and training compilations. Prioritize high-view-count playlists. Only return the search query.`,
      };

      const aiRes = await fetch('/api/ai/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiPrompts[category] }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        searchQuery = aiData.answer?.trim() || `${activePlan.title} ${category}`;
      } else {
        searchQuery = `${activePlan.title} ${category}`;
      }

      // Append quality modifiers based on category
      if (category === 'news' || category === 'events') {
        searchQuery += ' popular trending';
      } else {
        searchQuery += ' most viewed popular';
      }

      // Fetch data based on category
      if (category === 'news' || category === 'events') {
        const searchRes = await fetch('/api/search/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });

        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (category === 'news') {
            setNewsResults(prev => append ? [...prev, ...(searchData.results || [])] : (searchData.results || []));
          } else {
            setEventsResults(prev => append ? [...prev, ...(searchData.results || [])] : (searchData.results || []));
          }
        }
      } else {
        const ytRes = await fetch('/api/search/youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        });

        if (ytRes.ok) {
          const ytData = await ytRes.json();
          if (category === 'videos') {
            setVideosResults(prev => append ? [...prev, ...(ytData.videos || [])] : (ytData.videos || []));
          } else {
            setPlaylistsResults(prev => append ? [...prev, ...(ytData.videos || [])] : (ytData.videos || []));
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
      setSearchError(error instanceof Error ? error.message : 'Failed to load');
    } finally {
      setIsSearching(false);
    }
  }, [activePlan]);

  // Load more content for infinite scroll
  useEffect(() => {
    if (page > 1 && !selectedCategory) {
      const loadMore = async () => {
        // Fetch more data for each category
        await Promise.all([
          fetchCategoryData('news', true),
          fetchCategoryData('events', true),
          fetchCategoryData('videos', true),
          fetchCategoryData('playlists', true),
        ]);
        setIsLoadingMore(false);
      };
      loadMore();
    }
  }, [page, selectedCategory, fetchCategoryData]);

  // Auto-fetch preview data for all categories
  useEffect(() => {
    if (activePlan && !selectedCategory) {
      // Fetch small preview for each category
      const fetchPreviews = async () => {
        await Promise.all([
          fetchCategoryData('news'),
          fetchCategoryData('events'),
          fetchCategoryData('videos'),
          fetchCategoryData('playlists'),
        ]);
      };
      fetchPreviews();
    }
  }, [activePlan, selectedCategory, fetchCategoryData]);

  // Grid finalizer - fills empty spaces with additional content
  const finalizeGrid = useCallback(() => {
    const totalItems = newsResults.length + eventsResults.length + videosResults.length + playlistsResults.length;
    const minItemsNeeded = 18; // Minimum to fill the grid nicely
    
    if (totalItems < minItemsNeeded) {
      // If we don't have enough items, duplicate some visual content to fill grid
      const fillersNeeded = minItemsNeeded - totalItems;
      
      // Prefer to duplicate videos/playlists as they're more visual
      const visualContent = [...videosResults, ...playlistsResults];
      
      if (visualContent.length > 0) {
        // Add duplicates to fill empty spaces
        const fillers = Array(fillersNeeded)
          .fill(null)
          .map((_, idx) => visualContent[idx % visualContent.length]);
        
        // Add to appropriate arrays
        if (videosResults.length < 8) {
          setVideosResults(prev => [...prev, ...fillers.slice(0, 8 - prev.length)]);
        }
        if (playlistsResults.length < 6) {
          setPlaylistsResults(prev => [...prev, ...fillers.slice(0, 6 - prev.length)]);
        }
      }
    }
  }, [newsResults, eventsResults, videosResults, playlistsResults]);

  // Run grid finalizer after all data is loaded
  useEffect(() => {
    if (!isSearching && !isLoading && activePlan) {
      // Small delay to ensure all data is rendered
      const timer = setTimeout(() => {
        finalizeGrid();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSearching, isLoading, activePlan, finalizeGrid]);

  // Handle category click
  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    
    // Check if data already loaded
    const hasData = {
      news: newsResults.length > 0,
      events: eventsResults.length > 0,
      videos: videosResults.length > 0,
      playlists: playlistsResults.length > 0,
    };

    if (!hasData[category]) {
      fetchCategoryData(category);
    }
  };

  const baseWidth = 402;
  const baseHeight = 874;

  if (!mounted) return null;

  return (
    <div className="w-full h-screen bg-[#151515] flex items-center justify-center p-2 sm:p-4">
      <div
        className="bg-black rounded-[40px] overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh',
        }}
      >
        <div className="w-full h-full flex flex-col relative" style={{ backgroundColor: '#0b0b0b4D' }}>
          {/* Header */}
          <div className="flex w-full h-[6%] relative items-center">
            <div className="absolute top-3 left-3 z-20">
              <BurgerMenuButton />
            </div>
            
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="absolute top-3 left-14 z-20 p-2 rounded-full hover:bg-gray-700/50 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            
            <div className="w-full h-full flex items-center justify-center">
              {isLoading ? (
                <Spinner size={24} />
              ) : (
                <h1
                  className="text-white font-bold tracking-wider"
                  style={{ fontFamily: 'var(--font-hanalei-fill)', fontSize: '19px' }}
                >
                  {selectedCategory ? selectedCategory.toUpperCase() : 'ENTERTAIN'}
                </h1>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="w-full flex-1 overflow-hidden">
            {!selectedCategory ? (
              // Pinterest-style Masonry Grid
              <div ref={scrollContainerRef} className="w-full h-full overflow-y-auto scrollbar-thin scroll-fade-edges">
                <div className="p-2 grid grid-cols-2 gap-1.5" style={{ gridAutoRows: '1fr' }}>
                  {gridCells.map((cell, idx) => {
                    const spanClass = `col-span-${cell.colSpan} row-span-${cell.rowSpan}`;
                    
                    if (cell.type === 'news') {
                      const newsData = cell.data as GoogleSearchResult;
                      return (
                        <button
                          key={`news-${idx}`}
                          onClick={() => {
                            setSelectedCategory('news');
                            setSelectedLink({ url: newsData.link, title: newsData.title });
                          }}
                          className={`${spanClass} w-full h-full min-h-[140px] relative overflow-hidden group rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
                          style={{ background: cell.color }}
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                            <h3 className="text-sm font-semibold text-center line-clamp-2 mb-1 text-white drop-shadow-lg">
                              {newsData.title}
                            </h3>
                            <p className="text-[9px] text-center line-clamp-2 text-white/60">
                              {newsData.snippet}
                            </p>
                          </div>
                        </button>
                      );
                    }

                    if (cell.type === 'videos') {
                      const videoData = cell.data as YouTubeVideo;
                      return (
                        <button
                          key={`video-${idx}`}
                          onClick={() => {
                            setSelectedVideo({ url: videoData.url.link, title: videoData.title });
                          }}
                          className={`${spanClass} w-full h-full min-h-[140px] relative overflow-hidden group rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
                          style={{
                            backgroundImage: `url(${videoData.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-[10px] text-white font-medium line-clamp-1 drop-shadow-lg">{videoData.title}</p>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M5 3l14 9-14 9V3z" fill="#000" />
                              </svg>
                            </div>
                          </div>
                        </button>
                      );
                    }

                    if (cell.type === 'events') {
                      const eventData = cell.data as GoogleSearchResult;
                      return (
                        <button
                          key={`event-${idx}`}
                          onClick={() => {
                            setSelectedCategory('events');
                            setSelectedLink({ url: eventData.link, title: eventData.title });
                          }}
                          className={`${spanClass} w-full h-full min-h-[140px] relative overflow-hidden group rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
                          style={{ background: cell.color }}
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-2 opacity-70">
                              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="white" strokeWidth="1.5"/>
                            </svg>
                            <h3 className="text-sm font-semibold text-center line-clamp-2 mb-1 text-white drop-shadow-lg">
                              {eventData.title}
                            </h3>
                            <p className="text-[9px] text-center line-clamp-2 text-white/60">
                              {eventData.snippet}
                            </p>
                          </div>
                        </button>
                      );
                    }

                    if (cell.type === 'playlists') {
                      const playlistData = cell.data as YouTubeVideo;
                      return (
                        <button
                          key={`playlist-${idx}`}
                          onClick={() => {
                            setSelectedVideo({ url: playlistData.url.link, title: playlistData.title });
                          }}
                          className={`${spanClass} w-full h-full min-h-[140px] relative overflow-hidden group rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
                          style={{
                            backgroundImage: `url(${playlistData.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" stroke="white" strokeWidth="2" fill="white" fillOpacity="0.3"/>
                            </svg>
                            <p className="text-[10px] text-white font-medium line-clamp-1 drop-shadow-lg">{playlistData.title}</p>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M5 3l14 9-14 9V3z" fill="white" />
                              </svg>
                            </div>
                          </div>
                        </button>
                      );
                    }

                    return null;
                  })}
                </div>

                {/* Infinite Scroll Loading Indicator */}
                {isLoadingMore && (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/20"></div>
                  </div>
                )}

                {/* Initial Loading State */}
                {isSearching && gridCells.length === 0 && (
                    <div className="flex items-center justify-center p-8">
                      <Spinner size={28} />
                  </div>
                )}

                {/* Empty State */}
                {!isSearching && gridCells.length === 0 && (
                  <div className="flex items-center justify-center p-8">
                    <p className="text-sm" style={{ color: theme.colors.textMuted }}>Loading content...</p>
                  </div>
                )}
              </div>
            ) : (
              // Expanded Category View
              <div className="w-full h-full overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 grid grid-cols-1 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-full h-24 rounded-lg bg-gray-800/50 animate-pulse" />
                    ))}
                  </div>
                ) : searchError ? (
                  <div className="p-4 flex items-center justify-center h-full">
                    <div className="text-center">
                      <span className="text-sm" style={{ color: theme.colors.textMuted }}>{searchError}</span>
                      <button
                        onClick={() => fetchCategoryData(selectedCategory)}
                        className="mt-4 px-4 py-2 rounded-full text-sm font-semibold"
                        style={{ backgroundColor: theme.colors.primary, color: '#fff' }}
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 grid grid-cols-1 gap-3">
                    {selectedCategory === 'news' && newsResults.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedLink({ url: item.link, title: item.title })}
                        className="block w-full text-left rounded-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: theme.colors.background, border: `1px solid ${theme.colors.border}` }}
                      >
                        <div className="p-3">
                          <h3 className="text-sm font-semibold mb-1 line-clamp-2" style={{ color: theme.colors.text }}>{item.title}</h3>
                          <p className="text-xs mb-2 line-clamp-2" style={{ color: theme.colors.textSecondary }}>{item.snippet}</p>
                          <span className="text-[10px]" style={{ color: theme.colors.textMuted }}>{item.displayedLink}</span>
                        </div>
                      </button>
                    ))}

                    {selectedCategory === 'events' && eventsResults.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedLink({ url: item.link, title: item.title })}
                        className="block w-full text-left rounded-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: theme.colors.background, border: `1px solid ${theme.colors.border}` }}
                      >
                        <div className="p-3">
                          <h3 className="text-sm font-semibold mb-1 line-clamp-2" style={{ color: theme.colors.text }}>{item.title}</h3>
                          <p className="text-xs mb-2 line-clamp-2" style={{ color: theme.colors.textSecondary }}>{item.snippet}</p>
                          <span className="text-[10px]" style={{ color: theme.colors.textMuted }}>{item.displayedLink}</span>
                        </div>
                      </button>
                    ))}

                    {selectedCategory === 'videos' && videosResults.map((video, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedLink({ url: video.url.link, title: video.title })}
                        className="block w-full text-left rounded-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: theme.colors.background, border: `1px solid ${theme.colors.border}` }}
                      >
                        <div className="flex gap-3 p-3">
                          <img src={video.thumbnail} alt={video.title} className="w-24 h-16 object-cover rounded flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold mb-1 line-clamp-2" style={{ color: theme.colors.text }}>{video.title}</h3>
                            <p className="text-[10px]" style={{ color: theme.colors.textMuted }}>{video.reference}</p>
                          </div>
                        </div>
                      </button>
                    ))}

                    {selectedCategory === 'playlists' && playlistsResults.map((video, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedLink({ url: video.url.link, title: video.title })}
                        className="block w-full text-left rounded-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: theme.colors.background, border: `1px solid ${theme.colors.border}` }}
                      >
                        <div className="flex gap-3 p-3">
                          <img src={video.thumbnail} alt={video.title} className="w-24 h-16 object-cover rounded flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold mb-1 line-clamp-2" style={{ color: theme.colors.text }}>{video.title}</h3>
                            <p className="text-[10px]" style={{ color: theme.colors.textMuted }}>{video.reference}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* WebView Modal */}
      {selectedLink && (
        <WebViewModal
          url={selectedLink.url}
          title={selectedLink.title}
          onClose={() => setSelectedLink(null)}
        />
      )}
      
      {/* Internal links for SEO */}
      <nav className="flex justify-center gap-6 pb-4" style={{ opacity: 0.4 }}>
        <a href="/" className="text-white text-sm">Home</a>
        <a href="/blog" className="text-white text-sm">Fitness Blog</a>
        <a href="/planner" className="text-white text-sm">Workout Planner</a>
        <a href="/training-studio" className="text-white text-sm">Training Studio</a>
      </nav>

      {/* Floating Navigation Bar */}
      <FloatingNavBar />
    </div>
  );
}
