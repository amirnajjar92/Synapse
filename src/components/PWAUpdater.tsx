'use client';

import { useEffect } from 'react';

export default function PWAUpdater() {
  useEffect(() => {
    // Only register service worker in production
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined' && 
      'serviceWorker' in navigator
    ) {
      // Register service worker
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // Check for updates every 60 seconds
          setInterval(() => {
            registration.update();
          }, 60000);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, reload automatically
                  console.log('New version available! Reloading...');
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Listen for controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Controller changed, reloading page...');
        window.location.reload();
      });
    }
  }, []);

  return null;
}
