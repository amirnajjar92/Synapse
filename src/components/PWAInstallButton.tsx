'use client';

import { useState, useEffect } from 'react';
import { getTheme, loadTheme } from '@/lib/theme';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');

  const theme = getTheme(currentTheme);

  // Listen for theme changes
  useEffect(() => {
    setCurrentTheme(loadTheme());
    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail);
    };
    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, []);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstalled(false);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
  };

  // Don't show button if already installed or prompt not available
  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="group fixed top-4 right-4 z-50 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl"
      style={{
        background: currentTheme === 'light'
          ? 'linear-gradient(135deg, rgba(59, 99, 207, 0.95), rgba(99, 139, 247, 0.95))'
          : 'linear-gradient(135deg, rgba(59, 99, 207, 0.9), rgba(99, 139, 247, 0.9))',
        backdropFilter: 'blur(10px)',
      }}
      title="Install Synapse App"
    >
      {/* Download/Install Icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="transition-transform duration-300 group-hover:scale-110"
      >
        {/* Download arrow */}
        <path
          d="M12 3v12m0 0l-4-4m4 4l4-4"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Base tray */}
        <path
          d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full -z-10 blur-xl transition-opacity duration-300 opacity-60 group-hover:opacity-80"
        style={{
          background: `radial-gradient(circle, ${theme.colors.primary}, transparent 70%)`,
        }}
      />
    </button>
  );
}
