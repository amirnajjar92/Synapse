'use client';

import { useEffect, useRef, useCallback } from 'react';

interface PusherMessage {
  id: string;
  senderId: string;
  senderName: string | null;
  text: string;
  timestamp: string;
}

interface UsePusherOptions {
  conversationId: string | null;
  onMessage: (msg: PusherMessage) => void;
}

export function usePusher({ conversationId, onMessage }: UsePusherOptions) {
  const pusherRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!conversationId || !process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    const initPusher = async () => {
      const PusherJS = (await import('pusher-js')).default;

      pusherRef.current = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        forceTLS: true,
      });

      channelRef.current = pusherRef.current.subscribe(`chat-${conversationId}`);

      channelRef.current.bind('new-message', (data: PusherMessage) => {
        onMessageRef.current(data);
      });
    };

    initPusher();

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [conversationId]);
}
