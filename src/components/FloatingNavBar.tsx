'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AIIcon from './AIIcon';
import AIAssistantSheet from './AIAssistantSheet';
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
  const [showAIAssistant, setShowAIAssistant] = useState(false);
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
        className="relative rounded-full shadow-lg transition-all duration-500 ease-out overflow-hidden ml-auto"
        style={{
          background: '#000000',
          border: '0.5px solid #ffffff35',
          width: isExpanded ? 'min(380px, calc(100vw - 24px))' : '48px',
          height: '48px',
        }}
      >
        {/* Main Toggle Button with arrow (positioned on right) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute transition-all duration-500 rounded-full overflow-hidden flex items-center justify-center hover:bg-white/20 active:scale-95"
          style={{
            right: 'calc((48px - 45px) / 2)',
            top: 'calc((48px - 46px) / 2)',
            width: isExpanded ? 'min(72px, 20%)' : '44px',
            height: '44px',
            background: '#ffffff',
            border: '1px solid #000000',
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
              stroke="#000000"
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
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 active:scale-95 flex-shrink-0"
            style={{
              background: pathname === '/events' ? '#ffffff' : 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                stroke={pathname === '/events' ? '#000000' : '#ffffff'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="12" cy="15" r="1.5" fill={pathname === '/events' ? '#000000' : '#ffffff'} />
            </svg>
          </button>

          {/* Entertain */}
          <button
            onClick={() => handleNavClick('/entertain')}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 active:scale-95 flex-shrink-0"
            style={{
              background: pathname === '/entertain' ? '#ffffff' : 'transparent',
            }}
          >
            <img 
              src="/vectors/media-icon.svg" 
              alt="Media"
              className="w-5 h-5"
              style={{
                filter: pathname === '/entertain' ? 'invert(0)' : 'invert(1)',
              }}
            />
          </button>

          {/* Plan Progress (first from right - only show if there's an active plan) */}
          {activePlan && (
            <button
              onClick={() => handleNavClick(`/plan-progress-tracker?planId=${activePlan.id}`)}
              className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 active:scale-95 flex-shrink-0"
              style={{
                background: pathname === '/plan-progress-tracker' ? '#ffffff' : 'transparent',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  stroke={pathname === '/plan-progress-tracker' ? '#000000' : '#ffffff'}
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
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 active:scale-95 flex-shrink-0"
            style={{
              background: pathname === '/water-tracker' ? '#ffffff' : 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path
                d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"
                stroke={pathname === '/water-tracker' ? '#000000' : '#ffffff'}
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
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 active:scale-95 flex-shrink-0"
            style={{
              background: pathname === '/my-plans' ? '#ffffff' : 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                stroke={pathname === '/my-plans' ? '#000000' : '#ffffff'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path d="M9 12h6M9 16h6" stroke={pathname === '/my-plans' ? '#000000' : '#ffffff'} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Planner */}
          <button
            onClick={() => handleNavClick('/planner')}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 active:scale-95 flex-shrink-0"
            style={{
              background: pathname === '/planner' ? '#ffffff' : 'transparent',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke={pathname === '/planner' ? '#000000' : '#ffffff'} strokeWidth="2" fill="none" />
              <path d="M3 10h18M8 2v4M16 2v4" stroke={pathname === '/planner' ? '#000000' : '#ffffff'} strokeWidth="2" strokeLinecap="round" />
              <circle cx="8" cy="14" r="1" fill={pathname === '/planner' ? '#000000' : '#ffffff'} />
              <circle cx="12" cy="14" r="1" fill={pathname === '/planner' ? '#000000' : '#ffffff'} />
              <circle cx="16" cy="14" r="1" fill={pathname === '/planner' ? '#000000' : '#ffffff'} />
            </svg>
          </button>

          {/* AI Icon (last from right) */}
          <button
            onClick={() => {
              if (onAIClick) {
                onAIClick();
              } else {
                setShowAIAssistant(true);
              }
              setIsExpanded(false);
            }}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 active:scale-95 flex-shrink-0"
            style={{
              background: 'transparent',
            }}
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6">
              <AIIcon />
            </div>
          </button>
        </div>
      </div>

      {/* AI Assistant Sheet */}
      <AIAssistantSheet
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
    </div>
  );
}
