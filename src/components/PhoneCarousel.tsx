'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import PhonePreview from '@/components/PhonePreview';

const PAGES = [
  {
    path: '/workout-tracker?embed=true',
    name: 'Workout Tracker',
    desc: 'Daily workout view with day navigation, exercises targeted muscles, and coach chat',
  },
  {
    path: '/monitor?embed=true',
    name: 'Health Monitor',
    desc: 'Weight trends, cardio sessions, mood tracking, and your daily check-in history',
  },
  {
    path: '/training-studio?tab=dashboard&embed=true',
    name: 'Training Studio',
    desc: 'Full trainer dashboard with client management, plan builder, and real-time messaging',
  },
  {
    path: '/my-plans?embed=true',
    name: 'My Plans',
    desc: 'All your workout plans with status, progress, and AI-generated adjustments',
  },
  {
    path: '/plan-progress-tracker?embed=true',
    name: 'Progress Tracker',
    desc: 'AI-powered daily check-in analysis comparing plan vs actual performance',
  },
  {
    path: '/water-tracker?embed=true',
    name: 'Water Tracker',
    desc: 'Hydration logging with streak tracking, daily goals, and smart reminders',
  },
  {
    path: '/musclemap?embed=true',
    name: 'Muscle Map',
    desc: 'Interactive 3D anatomy reference with front/back views and muscle group highlight',
  },
];

export default function PhoneCarousel() {
  const { data: session, status } = useSession();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  const current = PAGES[currentIndex];

  const goTo = (index: number) => {
    if (index < 0 || index >= PAGES.length) return;
    setCurrentIndex(index);
    setIframeKey(k => k + 1);
  };

  // Loading auth state
  if (status === 'loading') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border border-white/20 animate-spin" style={{ borderTopColor: 'white', borderWidth: '2px' }} />
      </div>
    );
  }

  // Not authenticated — show static preview
  if (status !== 'authenticated') {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 min-h-0">
          <PhonePreview />
        </div>
        <div className="flex-shrink-0 px-3 pb-3 pt-1">
          <button
            onClick={() => signIn()}
            className="w-full py-2 rounded-xl bg-[#FC4C02] text-white text-[9px] font-semibold hover:bg-[#e04302] transition-colors"
          >
            Sign in to see your live app
          </button>
        </div>
      </div>
    );
  }

  // Authenticated — show iframe carousel
  return (
    <div className="w-full h-full flex flex-col">
      {/* Iframe phone view */}
      <div className="flex-1 min-h-0 relative">
        <iframe
          key={iframeKey}
          src={current.path}
          className="w-full h-full"
          style={{ border: 'none' }}
          title={current.name}
        />
      </div>

      {/* Page info */}
      <div className="flex-shrink-0 px-3 pt-2 pb-1">
        <p className="text-white text-[9px] font-semibold">{current.name}</p>
        <p className="text-white/40 text-[7px] leading-relaxed mt-0.5 line-clamp-2">{current.desc}</p>
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 px-3 pb-2 flex items-center justify-between">
        <button
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="p-1.5 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5">
          {PAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${
                i === currentIndex
                  ? 'w-3.5 h-1.5 bg-[#FC4C02]'
                  : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex === PAGES.length - 1}
          className="p-1.5 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
