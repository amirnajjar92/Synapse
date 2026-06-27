'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BurgerMenuButton from '@/components/BurgerMenuButton';
import FloatingNavBar from '@/components/FloatingNavBar';
import WebViewModal from '@/components/WebViewModal';
import type { GoogleSearchResult } from '@/types/search';

interface Plan {
  id: string;
  title: string;
  prompt: string;
  status: string;
}

const Spinner = ({ size = 32 }: { size?: number }) => (
  <div className="flex items-center justify-center">
    <div
      className="rounded-full border border-white/20 animate-spin"
      style={{ width: size, height: size, borderTopColor: 'white', borderWidth: '2px' }}
    />
  </div>
);

export default function EventsPage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [events, setEvents] = useState<GoogleSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<GoogleSearchResult | null>(null);

  const baseWidth = 402;
  const baseHeight = 874;

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
      const aiPrompt = `Based on this fitness plan: "${activePlan.prompt}", generate a concise Google search query (4-6 words) to find promoted public sport events, major competitions, and official races for 2026. Prioritize well-publicized running marathons, triathlons, CrossFit Opens, and charity runs. Only return the search query, nothing else.`;

      const aiRes = await fetch('/api/ai/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: aiPrompt }),
      });

      if (!aiRes.ok) {
        throw new Error('Failed to generate search query');
      }

      const aiData = await aiRes.json();
      let searchQuery = aiData.answer?.trim() || `${activePlan.title} events 2026`;

      searchQuery += ' 2026 promoted official';

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

  if (!mounted) return null;

  return (
    <div className="w-full h-screen flex items-center justify-center p-2 sm:p-4" style={{ backgroundColor: '#0b0b0b' }}>
      <div
        className="overflow-hidden shadow-2xl relative flex-shrink-0"
        style={{
          width: `min(95vw, ${baseWidth}px)`,
          aspectRatio: baseWidth / baseHeight,
          maxHeight: '95vh',
          borderRadius: '40px',
          backgroundColor: 'rgba(11, 11, 11, 0.3)',
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
                <div className="flex items-center justify-center" style={{ width: 128, height: 32 }}>
                  <Spinner size={20} />
                </div>
              ) : (
                <span
                  className="text-xl sm:text-2xl font-bold tracking-wider"
                  style={{ fontFamily: 'var(--font-hanalei-fill)', color: '#e5e5e5' }}
                >
                  EVENTS
                </span>
              )}
            </div>
            <button
              onClick={fetchEvents}
              disabled={isSearching || !activePlan}
              className="absolute top-3 right-3 z-20 flex items-center justify-center w-7 h-7 rounded-full transition-all hover:bg-white/10 disabled:opacity-30"
              aria-label="Refresh events"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isSearching ? 'animate-spin' : ''}
              >
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15.36-5.64L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15.36 5.64L3 16" />
              </svg>
            </button>
          </div>

          {/* Events List */}
          <div className="w-full flex-1 overflow-hidden">
            {isLoading || isSearching ? (
              <div className="p-4 flex items-center justify-center h-full">
                <Spinner size={28} />
              </div>
            ) : searchError ? (
              <div className="p-4 flex items-center justify-center h-full">
                <div className="text-center">
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {searchError}
                  </span>
                  <button
                    onClick={fetchEvents}
                    className="mt-4 px-4 py-2 rounded-full text-sm font-semibold"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : events.length === 0 ? (
              <div className="p-4 flex items-center justify-center h-full">
                <span className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No events found.
                  <br />
                  <button
                    onClick={fetchEvents}
                    className="mt-2 text-xs underline"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Search again
                  </button>
                </span>
              </div>
            ) : (
              <div
                ref={scrollContainerRef}
                className="w-full h-full overflow-y-auto scrollbar-thin scroll-fade-edges"
              >
                <div className="p-3 grid grid-cols-1 gap-2">
                  {events.map((event, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedEvent(event)}
                      className="block w-full text-left rounded-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div className="p-3">
                        <h3 className="text-sm font-semibold mb-1 line-clamp-2" style={{ color: '#e5e5e5' }}>
                          {event.title}
                        </h3>
                        <p className="text-xs mb-2 line-clamp-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                          {event.snippet}
                        </p>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {event.displayedLink || new URL(event.link).hostname}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
