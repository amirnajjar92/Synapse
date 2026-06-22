'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getTheme, loadTheme } from '@/lib/theme';

export default function NotificationBellButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [hasUnreadReminders, setHasUnreadReminders] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentTheme(loadTheme());
    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail);
    };
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, []);

  // Check if user has enabled reminders
  useEffect(() => {
    if (!mounted || status !== 'authenticated' || !session?.user?.email) return;

    const checkReminders = async () => {
      try {
        const response = await fetch(
          `/api/reminders?email=${encodeURIComponent(session.user!.email!)}`
        );
        if (response.ok) {
          const data = await response.json();
          const hasActive = data.reminders?.some((r: any) => r.enabled);
          setHasUnreadReminders(hasActive);
        }
      } catch (error) {
        console.error('Error checking reminders:', error);
      }
    };

    checkReminders();
  }, [session, status, pathname, mounted]); // Re-check when navigating

  // Don't render on server or before mount
  if (!mounted) return null;

  const isActive = pathname === '/reminders';

  return (
    <button
      onClick={() => router.push('/reminders')}
      className="fixed top-4 right-4 z-50 group"
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: isActive
          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(236, 72, 153, 0.9))'
          : currentTheme === 'light'
          ? 'rgba(240, 240, 245, 0.95)'
          : 'rgba(30, 41, 59, 0.95)',
        backdropFilter: 'blur(12px)',
        border: currentTheme === 'light'
          ? '1px solid rgba(0, 0, 0, 0.08)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: isActive
          ? '0 8px 32px rgba(168, 85, 247, 0.4)'
          : currentTheme === 'light'
          ? '0 4px 16px rgba(0, 0, 0, 0.1)'
          : '0 4px 16px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
        e.currentTarget.style.boxShadow = isActive
          ? '0 12px 40px rgba(168, 85, 247, 0.5)'
          : currentTheme === 'light'
          ? '0 8px 24px rgba(0, 0, 0, 0.15)'
          : '0 8px 24px rgba(0, 0, 0, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)';
        e.currentTarget.style.boxShadow = isActive
          ? '0 8px 32px rgba(168, 85, 247, 0.4)'
          : currentTheme === 'light'
          ? '0 4px 16px rgba(0, 0, 0, 0.1)'
          : '0 4px 16px rgba(0, 0, 0, 0.3)';
      }}
      aria-label="Notifications and Reminders"
    >
      {/* Bell Icon */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        className="relative z-10"
      >
        <path
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          stroke={isActive ? 'white' : currentTheme === 'light' ? '#1a202c' : 'white'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Active Indicator Dot */}
      {hasUnreadReminders && !isActive && (
        <span
          className="absolute top-1 right-1"
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: '2px solid ' + (currentTheme === 'light' ? '#f0f0f5' : '#1e293b'),
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: isActive
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
      />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
      `}</style>
    </button>
  );
}
