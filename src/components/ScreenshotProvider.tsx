'use client';

import { useEffect, createContext, useContext, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { MOCK_USER, MOCK_WATER_ENTRIES } from '@/lib/screenshot-data';

const ScreenshotContext = createContext<{ isScreenshotMode: boolean }>({ isScreenshotMode: false });

export const useScreenshotMode = () => useContext(ScreenshotContext);

export default function ScreenshotProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isScreenshotMode = searchParams?.get('show') === 'true';
  const seeded = useRef(false);

  useEffect(() => {
    if (!isScreenshotMode || seeded.current) return;
    seeded.current = true;

    localStorage.setItem('synapse_user', JSON.stringify(MOCK_USER));

    // Seed water entries for today
    const todayKey = new Date().toISOString().split('T')[0];
    localStorage.setItem(`water_cups_${todayKey}`, '4');

    // Seed mock water history
    MOCK_WATER_ENTRIES.forEach(entry => {
      localStorage.setItem(`water_cups_${entry.date}`, String(entry.amount));
    });

    document.documentElement.classList.add('screenshot-mode');
  }, [isScreenshotMode]);

  return (
    <ScreenshotContext.Provider value={{ isScreenshotMode }}>
      {children}
    </ScreenshotContext.Provider>
  );
}
