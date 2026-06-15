'use client';

import { useSidebar } from './SidebarContext';

export default function BurgerMenuButton() {
  const { isOpen, setIsOpen } = useSidebar();
  
  if (isOpen) return null;

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold text-lg shadow-lg hover:scale-110 transition-transform flex-shrink-0"
      style={{
        boxShadow: '0 0 15px rgba(59, 130, 246, 0.8)',
        border: '2px solid rgba(59, 130, 246)'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16M4 12h16M4 18h16" stroke="black" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}
