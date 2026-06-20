'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import WebViewModal from '@/components/WebViewModal';
import { getTheme, loadTheme } from '@/lib/theme';
import type { GoogleSearchResult } from '@/types/search';

interface Plan {
  id: string;
  title: string;
  prompt: string;
  status: string;
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] ${className}`} />
);

export default function EventsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [events, setEvents] = useState<GoogleSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [borderRadius, setBorderRadius] = useState('40px');
  const [selectedEvent, setSelectedEvent] = useState<GoogleSearchResult | null>(null);

  const theme = getTheme(currentTheme);

  // Bootstrap
  useEffect(() => {
    setMounted(true);
    setCurrentTheme(loadTheme());
    const userStr = localStorage.getItem('synapse_user');
    if (!userStr) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userStr));

    // Listen for theme changes
    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail);
    };
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, [router]);

  // Adaptive border radius
  useEffect(() => {
    const updateBorderRadius = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const minDimension = Math.min(vh, vw);
      
      if (minDimension < 400) {
        setBorderRadius('20px');
      } else if (minDimension < 600) {
        setBorderRadius('30px');
      } else {
        setBorderRadius('40px');
      }
    };

    updateBorderRadius();
    window.addEventListener('resize', updateBorderRadius);
    return () => window.removeEventListener('resize', updateBorderRadius);
  }, []);

  // Fetch active plan
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

  // Generate AI search query and fetch events
  const fetchEvents = useCallback(async () => {
    if (!activePlan) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      // Step 1: Generate optimal search query using AI
      const aiPrompt = `Based on this fitness plan: "${activePlan.prompt}", generate a concise Google search query (maximum 5-7 words) to find upcoming sport events, competitions, or challenges. Prioritize cardio-focused events (running, marathon, triathlon, cycling), CrossFit competitions, and include "Bodonado Run Club" events. Focus on the sport type and location if mentioned. Only return the search query, nothing else.`;

      const aiRes = await fetch('/api/ai/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiPrompt }),
      });

      if (!aiRes.ok) {
        throw new Error('Failed to generate search query');
      }

      const aiData = await aiRes.json();
      const searchQuery = aiData.answer?.trim() || `${activePlan.title} events 2026`;

      // Don't log the search query to keep it hidden from users
      // console.log('AI Generated Search Query:', searchQuery);

      // Step 2: Search Google with the AI-generated query
      const searchRes = await fetch('/api/search/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!searchRes.ok) {
        throw new Error('Failed to fetch events');
      }

      const searchData = await searchRes.json();
      setEvents(searchData.results || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to load events');
    } finally {
      setIsSearching(false);
    }
  }, [activePlan]);

  // Auto-fetch events when plan loads
  useEffect(() => {
    if (activePlan && !isSearching && events.length === 0) {
      fetchEvents();
    }
  }, [activePlan, isSearching, events.length, fetchEvents]);

  const baseWidth = 402;
  const baseHeight = 874;

  if (!mounted) return null;

  return (
    <div
      className="w-full h-screen flex items-center justify-center p-2 sm:p-4"
      style={{ backgroundColor: theme.colors.background }}
    >
      <div
        className="overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh',
          borderRadius: borderRadius,
          backgroundColor: theme.colors.card,
        }}
      >
        <div className="w-full h-full flex flex-col relative">
          {/* Header */}
          <div className="flex w-full h-[6%] relative items-center">
            <div className="absolute top-3 left-3 z-20">
              <BurgerMenuButton />
            </div>
            <div className="w-full h-full flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-32 h-8" />
              ) : (
                <span
                  className="text-xl sm:text-2xl font-bold tracking-wider"
                  style={{
                    color: theme.colors.text,
                    fontFamily: 'var(--font-hanalei-fill)',
                  }}
                >
                  EVENTS
                </span>
              )}
            </div>
          </div>

          {/* Events Collage Area */}
          <div className="w-full flex-1 border overflow-y-auto" style={{ borderColor: theme.colors.border }}>
            {isLoading || isSearching ? (
              <div className="p-4 grid grid-cols-1 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="w-full h-24 rounded-lg" />
                ))}
              </div>
            ) : searchError ? (
              <div className="p-4 flex items-center justify-center h-full">
                <div className="text-center">
                  <span className="text-sm" style={{ color: theme.colors.textMuted }}>
                    {searchError}
                  </span>
                  <button
                    onClick={fetchEvents}
                    className="mt-4 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: '#fff',
                    }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : events.length === 0 ? (
              <div className="p-4 flex items-center justify-center h-full">
                <span className="text-sm text-center" style={{ color: theme.colors.textMuted }}>
                  No events found.
                  <br />
                  <button
                    onClick={fetchEvents}
                    className="mt-2 text-xs underline"
                    style={{ color: theme.colors.primary }}
                  >
                    Search again
                  </button>
                </span>
              </div>
            ) : (
              <div className="p-3 grid grid-cols-1 gap-3">
                {events.map((event, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedEvent(event)}
                    className="block w-full text-left rounded-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    <div className="p-3">
                      <h3
                        className="text-sm font-semibold mb-1 line-clamp-2"
                        style={{ color: theme.colors.text }}
                      >
                        {event.title}
                      </h3>
                      <p
                        className="text-xs mb-2 line-clamp-2"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {event.snippet}
                      </p>
                      <span
                        className="text-[10px]"
                        style={{ color: theme.colors.textMuted }}
                      >
                        {event.displayedLink || new URL(event.link).hostname}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh Button Row */}
          <div className="w-full h-[8%] border flex items-center justify-center px-3" style={{ borderColor: theme.colors.border }}>
            <button
              onClick={fetchEvents}
              disabled={isSearching || !activePlan}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-30"
              style={{
                backgroundColor: theme.colors.primary,
                color: '#fff',
              }}
            >
              {isSearching ? 'Searching...' : '🔄 Refresh Events'}
            </button>
          </div>
        </div>
      </div>

      {/* WebView Modal */}
      {selectedEvent && (
        <WebViewModal
          url={selectedEvent.link}
          title={selectedEvent.title}
          onClose={() => setSelectedEvent(null)}
        />
      )}
      
      {/* Floating Navigation Bar */}
      <FloatingNavBar />
    </div>
  );
}
