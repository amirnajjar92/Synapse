'use client';

import { useSidebar } from './SidebarContext';

export default function BurgerMenuButton() {
  const { isOpen, setIsOpen } = useSidebar();
  
  if (isOpen) return null;

  return (
    <button
      data-screenshot-hide="true"
      onClick={() => setIsOpen(true)}
      className="group relative w-12 h-12 flex items-center justify-center hover:scale-105 transition-all duration-300 flex-shrink-0 rounded-full"
      style={{
        background: 'rgba(55, 65, 81, 0.8)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Edge tab/tongue shape */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          {/* Main tab shape */}
          <path
            d="M8 8 L8 40 L32 40 Q40 40 40 32 L40 16 Q40 8 32 8 Z"
            fill="url(#gradient)"
            className="drop-shadow-lg opacity-0"
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="100%" stopColor="rgba(230,230,230,0.9)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Arrow icon */}
      <div className="relative z-10 flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-0.5 transition-transform duration-300">
          <path 
            d="M9 5l7 7-7 7" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {/* Subtle glow effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300 blur-md -z-10"
        style={{
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.4), transparent 70%)'
        }}
      />
    </button>
  );
}
