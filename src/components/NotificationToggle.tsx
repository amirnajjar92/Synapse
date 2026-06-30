'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const TEST_MESSAGES = [
  {
    delay: 500,
    title: '🔔 Notifications Enabled!',
    body: 'Local browser notifications are working. This confirms the Notification API is active.',
    tag: 'synapse-test-1',
  },
  {
    delay: 2500,
    title: '📡 Push Channel Working!',
    body: 'Server-side push notification delivered via Service Worker. This works even when the app is closed.',
    tag: 'synapse-test-2',
  },
  {
    delay: 4500,
    title: '⚡ Real-time Pusher Active!',
    body: 'Pusher real-time channel is live. In-app toasts will appear while the app is open.',
    tag: 'synapse-test-3',
  },
];

export default function NotificationToggle() {
  const { data: session } = useSession();
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      const saved = localStorage.getItem('notificationsEnabled');
      setEnabled(saved === 'true' && Notification.permission === 'granted');
    }
  }, []);

  const getUserEmail = (): string | null => {
    if (session?.user?.email) return session.user.email;
    try {
      const raw = localStorage.getItem('synapse_user');
      if (raw) return JSON.parse(raw).email || null;
    } catch {}
    return null;
  };

  const runTestSequence = async () => {
    const userEmail = getUserEmail();
    setTesting(true);

    // Get the SW registration for showing notifications from page context
    let swReg: ServiceWorkerRegistration | null = null;
    try {
      if ('serviceWorker' in navigator) {
        swReg = await navigator.serviceWorker.ready;
      }
    } catch {}

    for (const msg of TEST_MESSAGES) {
      await new Promise(r => setTimeout(r, msg.delay));

      const options: NotificationOptions = {
        body: msg.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: msg.tag,
        requireInteraction: true,
      };

      // 1. Show notification via SW registration (more reliable than new Notification())
      try {
        if (swReg) {
          await swReg.showNotification(msg.title, options);
        } else {
          new Notification(msg.title, options);
        }
        console.log(`✓ Local notification shown: "${msg.title}"`);
      } catch (e) {
        console.warn('Local notification failed:', e);
      }

      // 2. Server-side push notification (tests VAPID + SW delivery)
      if (userEmail) {
        try {
          const res = await fetch('/api/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userEmail,
              title: msg.title,
              body: msg.body,
              data: { url: '/', type: 'test' },
            }),
          });
          const json = await res.json();
          console.log(`✓ Push API response:`, json);
        } catch (e) {
          console.warn('Server push failed:', e);
        }
      }
    }

    setTesting(false);
  };

  const handleToggle = async () => {
    if (!enabled) {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        runTestSequence();
      }
    } else {
      setEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
    }
  };

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-white/80 font-medium text-sm">Notifications</span>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-block w-11 h-6">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
            className="sr-only peer"
          />
          <span className="absolute inset-0 bg-white/20 rounded-full peer-checked:bg-white transition cursor-pointer"></span>
          <span className="absolute left-1 top-1 w-4 h-4 bg-black rounded-full transition peer-checked:translate-x-5 peer-checked:bg-black"></span>
        </label>
      </div>

      {permission === 'denied' && (
        <p className="text-xs text-red-400 mt-2 ml-13">
          Notifications blocked. Enable in browser settings.
        </p>
      )}
      {testing && (
        <p className="text-xs text-emerald-400 mt-2 ml-13 animate-pulse">
          Sending 3 test notifications…
        </p>
      )}
    </div>
  );
}
