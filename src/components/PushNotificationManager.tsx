'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from(raw.split('').map(c => c.charCodeAt(0)));
}

export default function PushNotificationManager() {
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (registered) return;

    let cancelled = false;

    const init = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (cancelled) return;

        // Get user email from localStorage
        let userEmail = '';
        try {
          const raw = localStorage.getItem('synapse_user');
          if (raw) userEmail = JSON.parse(raw).email || '';
        } catch {}

        if (!userEmail) return;

        // Check existing subscription first
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          setRegistered(true);
          return;
        }

        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicKey) return;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as any,
        });

        if (cancelled) return;

        const json = sub.toJSON();

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            endpoint: json.endpoint,
            p256dh: json.keys?.p256dh,
            auth: json.keys?.auth,
          }),
        });

        setRegistered(true);
      } catch (err) {
        console.warn('Push subscription failed:', err);
      }
    };

    // Wait for SW to be ready
    if (navigator.serviceWorker.controller) {
      init();
    } else {
      navigator.serviceWorker.addEventListener('controllerchange', init);
    }

    return () => { cancelled = true; };
  }, [registered]);

  return null;
}
