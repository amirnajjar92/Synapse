'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AIIcon from './AIIcon';
import AIAssistantSheet from './AIAssistantSheet';

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
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

  const handleNavClick = (path: string) => {
    router.push(path);
    setIsExpanded(false);
  };

  const isActive = (path: string) => pathname === path;

  const iconBase = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

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
      <div
        className="relative rounded-full shadow-lg transition-all duration-500 ease-out overflow-hidden ml-auto"
        style={{
          background: '#000000',
          border: '0.5px solid #ffffff35',
          width: isExpanded ? 'min(380px, calc(100vw - 24px))' : '48px',
          height: '48px',
        }}
      >
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="transition-all duration-500"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path d="M15 18l-6-6 6-6" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          className="absolute h-full flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 transition-all duration-500"
          style={{
            right: isExpanded ? 'min(82px, 22%)' : '50px',
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? 'auto' : 'none',
          }}
        >
          {/* Events - Calendar sparkle */}
          <button
            onClick={() => handleNavClick('/events')}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 active:scale-95 flex-shrink-0"
            style={{ background: isActive('/events') ? '#ffffff' : 'transparent' }}
          >
            <svg {...iconBase} stroke={isActive('/events') ? '#000000' : '#ffffff'}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <path d="M14 14l-1 1 1 1" />
              <path d="M10 16l1-1-1-1" />
            </svg>
          </button>

          {/* Entertain - Play square */}
          <button
            onClick={() => handleNavClick('/entertain')}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 active:scale-95 flex-shrink-0"
            style={{ background: isActive('/entertain') ? '#ffffff' : 'transparent' }}
          >
            <svg {...iconBase} stroke={isActive('/entertain') ? '#000000' : '#ffffff'}>
              <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
              <polygon points="10,8 16,12 10,16" fill={isActive('/entertain') ? '#000000' : '#ffffff'} />
            </svg>
          </button>

          {/* Plan Progress - Trending up */}
          {activePlan && (
            <button
              onClick={() => handleNavClick(`/plan-progress-tracker?planId=${activePlan.id}`)}
              className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 active:scale-95 flex-shrink-0"
              style={{ background: isActive('/plan-progress-tracker') ? '#ffffff' : 'transparent' }}
            >
              <svg {...iconBase} stroke={isActive('/plan-progress-tracker') ? '#000000' : '#ffffff'}>
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </button>
          )}

          {/* Water Tracker - Droplet */}
          <button
            onClick={() => handleNavClick('/water-tracker')}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 active:scale-95 flex-shrink-0"
            style={{ background: isActive('/water-tracker') ? '#ffffff' : 'transparent' }}
          >
            <svg {...iconBase} stroke={isActive('/water-tracker') ? '#000000' : '#ffffff'}>
              <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
            </svg>
          </button>

          {/* My Plans - Clipboard list */}
          <button
            onClick={() => handleNavClick('/my-plans')}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 active:scale-95 flex-shrink-0"
            style={{ background: isActive('/my-plans') ? '#ffffff' : 'transparent' }}
          >
            <svg {...iconBase} stroke={isActive('/my-plans') ? '#000000' : '#ffffff'}>
              <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="13" y2="17" />
              <path d="M9 3v3h6V3" />
            </svg>
          </button>

          {/* Planner - Calendar days */}
          <button
            onClick={() => handleNavClick('/planner')}
            className="group w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/20 active:scale-95 flex-shrink-0"
            style={{ background: isActive('/planner') ? '#ffffff' : 'transparent' }}
          >
            <svg {...iconBase} stroke={isActive('/planner') ? '#000000' : '#ffffff'}>
              <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <circle cx="8" cy="14" r="1" fill={isActive('/planner') ? '#000000' : '#ffffff'} />
              <circle cx="12" cy="14" r="1" fill={isActive('/planner') ? '#000000' : '#ffffff'} />
              <circle cx="16" cy="14" r="1" fill={isActive('/planner') ? '#000000' : '#ffffff'} />
            </svg>
          </button>

          {/* AI Icon */}
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
            style={{ background: 'transparent' }}
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6">
              <AIIcon />
            </div>
          </button>
        </div>
      </div>

      <AIAssistantSheet
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
    </div>
  );
}
