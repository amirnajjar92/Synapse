'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface NotificationEvent {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

export default function PusherNotificationListener() {
  const [toast, setToast] = useState<NotificationEvent | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((event: NotificationEvent) => {
    setToast(event);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let userEmail = '';
    try {
      const raw = localStorage.getItem('synapse_user');
      if (raw) userEmail = JSON.parse(raw).email || '';
    } catch {}

    if (!userEmail) return;

    let pusher: any = null;
    let channel: any = null;

    const init = async () => {
      try {
        const Pusher = (await import('pusher-js')).default;
        const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
        if (!key || !cluster) return;

        pusher = new Pusher(key, { cluster });
        channel = pusher.subscribe(`notifications-${userEmail}`);
        channel.bind('notification', (data: NotificationEvent) => {
          showToast(data);
          // Also show system notification via SW registration (works on all pages)
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(reg => {
              const nData = data.data as Record<string, unknown> | undefined;
              reg.showNotification(data.title, {
                body: data.body || '',
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                tag: 'synapse-chat',
                requireInteraction: true,
                data: nData || {},
              });
            }).catch(() => {});
          }
        });
      } catch {}
    };

    init();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (channel && pusher) {
        channel.unbind_all();
        pusher.unsubscribe(`notifications-${userEmail}`);
        pusher.disconnect();
      }
    };
  }, [showToast]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs animate-slide-up">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-2xl backdrop-blur-xl">
        <p className="text-white text-xs font-semibold truncate">{toast.title}</p>
        {toast.body && (
          <p className="text-zinc-400 text-[10px] mt-0.5 line-clamp-2">{toast.body}</p>
        )}
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}
