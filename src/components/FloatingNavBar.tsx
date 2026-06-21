'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AIIcon from './AIIcon';
import { getTheme, loadTheme } from '@/lib/theme';

interface FloatingNavBarProps {
  onAIClick?: () => void;
}

interface Plan {
  id: string;
  title: string;
  status: string;
}

export default function FloatingNavBar({ onAIClick }: FloatingNavBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const router = useRouter();
  const pathname = usePathname();

  const theme = getTheme(currentTheme);

  // Fetch active plan on mount
  useEffect(() => {
    const fetchActivePlan = async () => {
      const userStr = localStorage.getItem('synapse_user');
      if (!userStr) return;
      
      const user = JSON.parse(userStr);
      try {
        const response = await fetch('/api/users/me/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        });

        if (response.ok) {
          const data = await response.json();
          const plans: Plan[] = data.plans || [];
          const active = plans.find((p: Plan) => p.status === 'IN_PROGRESS');
          setActivePlan(active || null);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      }
    };

    fetchActivePlan();
  }, []);

  // Listen for theme changes
  useEffect(() => {
    setCurrentTheme(loadTheme());
    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail);
    };
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, []);

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsExpanded(false);
  };

  return (
    <div 
      className="fixed bottom-4 sm:bottom-8 z-40 transition-all duration-500" 
      style={{ 
        maxWidth: 'calc(100vw - 16px)',
        right: isExpanded ? 'auto' : '8px',
        left: isExpanded ? '50%' : 'auto',
        transform: isExpanded ? 'translateX(-50%)' : 'none',
      }}
    >
      {/* Floating Nav Bar */}
      <div
        className="relative backdrop-blur-2xl rounded-full shadow-2xl transition-all duration-500 ease-out overflow-hidden ml-auto"
        style={{
          background: currentTheme === 'light' 
            ? 'rgba(240, 240, 245, 0.85)' 
            : 'rgba(20, 30, 48, 0.85)',
          border: currentTheme === 'light'
            ? '1px solid rgba(0, 0, 0, 0.08)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          width: isExpanded ? 'min(380px, calc(100vw - 24px))' : '48px',
          height: '48px',
        }}
      >
        {/* Main Toggle Button with arrow (positioned on right) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute transition-all duration-500 rounded-full overflow-hidden flex items-center justify-center hover:scale-105 active:scale-95"
          style={{
            right: 'calc((48px - 45px) / 2)',
            top: 'calc((48px - 46px) / 2)',
            width: isExpanded ? 'min(72px, 20%)' : '44px',
            height: '44px',
            background: currentTheme === 'light'
              ? 'rgba(200, 200, 210, 0.8)'
              : 'rgba(55, 65, 81, 0.8)',
          }}
        >
          {/* Arrow icon - points left when collapsed, animates when expanded */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="transition-all duration-500"
            style={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke={currentTheme === 'light' ? '#000000' : 'white'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Expanded Navigation Items (right to left: Progress, Water, Plans, Planner, AI) */}
        <div
          className="absolute h-full flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 transition-all duration-500"
          style={{
            right: isExpanded ? 'min(82px, 22%)' : '50px',
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? 'auto' : 'none',
          }}
        >
          {/* Events */}
          <button
            onClick={() => handleNavClick('/events')}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
            style={{
              background: pathname === '/events' 
                ? (currentTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)') 
                : 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                stroke={currentTheme === 'light' ? '#000000' : 'white'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="12" cy="15" r="1.5" fill={currentTheme === 'light' ? '#000000' : 'white'} />
            </svg>
          </button>

          {/* Entertain */}
          <button
            onClick={() => handleNavClick('/entertain')}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
            style={{
              background: pathname === '/entertain' 
                ? (currentTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)') 
                : 'transparent',
            }}
          >
            <img 
              src="/vectors/media-icon.svg" 
              alt="Media"
              className="w-5 h-5"
              style={{
                filter: currentTheme === 'light' ? 'invert(0)' : 'invert(1)',
              }}
            />
          </button>

          {/* Plan Progress (first from right - only show if there's an active plan) */}
          {activePlan && (
            <button
              onClick={() => handleNavClick(`/plan-progress-tracker?planId=${activePlan.id}`)}
              className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
              style={{
                background: pathname === '/plan-progress-tracker' 
                  ? (currentTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)') 
                  : 'transparent',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  stroke={currentTheme === 'light' ? '#000000' : 'white'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </button>
          )}

          {/* Water Tracker */}
          <button
            onClick={() => handleNavClick('/water-tracker')}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
            style={{
              background: pathname === '/water-tracker' 
                ? (currentTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)') 
                : 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path
                d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
                stroke={currentTheme === 'light' ? '#000000' : 'white'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>

          {/* My Plans */}
          <button
            onClick={() => handleNavClick('/my-plans')}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
            style={{
              background: pathname === '/my-plans' 
                ? (currentTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)') 
                : 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                stroke={currentTheme === 'light' ? '#000000' : 'white'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path d="M9 12h6M9 16h6" stroke={currentTheme === 'light' ? '#000000' : 'white'} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Planner */}
          <button
            onClick={() => handleNavClick('/planner')}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 flex-shrink-0"
            style={{
              background: pathname === '/planner' 
                ? (currentTheme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)') 
                : 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke={currentTheme === 'light' ? '#000000' : 'white'} strokeWidth="2" fill="none" />
              <path d="M3 10h18M8 2v4M16 2v4" stroke={currentTheme === 'light' ? '#000000' : 'white'} strokeWidth="2" strokeLinecap="round" />
              <circle cx="8" cy="14" r="1" fill={currentTheme === 'light' ? '#000000' : 'white'} />
              <circle cx="12" cy="14" r="1" fill={currentTheme === 'light' ? '#000000' : 'white'} />
              <circle cx="16" cy="14" r="1" fill={currentTheme === 'light' ? '#000000' : 'white'} />
            </svg>
          </button>

          {/* AI Icon (last from right) */}
          <button
            onClick={() => {
              onAIClick?.();
              setIsExpanded(false);
            }}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-purple-500/20 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
            }}
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300">
              <AIIcon />
            </div>
          </button>
        </div>

        {/* Ambient Glow */}
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-500 -z-10 blur-2xl"
          style={{
            background: `radial-gradient(circle, ${theme.colors.primary}40, transparent 70%)`,
            opacity: isExpanded ? 0.8 : 0.4,
          }}
        />
      </div>
    </div>
  );
}
