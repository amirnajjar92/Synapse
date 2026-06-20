'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Page-specific theme colors
const PAGE_THEME_COLORS: Record<string, string> = {
  '/monitor': '#0a0a0a',        // Dark background
  '/water-tracker': '#2C2C2C',  // Gray background
  '/plan-progress-tracker': '#0a0a0a',
  '/events': '#0a0a0a',         // Dark background
  '/entertain': '#0a0a0a',      // Dark background
  // Add more pages as needed
};

export default function DynamicThemeColor() {
  const pathname = usePathname();

  useEffect(() => {
    // Get theme color for current page, default to dark
    const themeColor = PAGE_THEME_COLORS[pathname] || '#0a0a0a';

    // Update meta tag
    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', themeColor);

    // Update Apple status bar style dynamically
    let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleStatusBar) {
      // Use black-translucent for adaptive status bar
      appleStatusBar.setAttribute('content', 'black-translucent');
    }
  }, [pathname]);

  return null;
}
