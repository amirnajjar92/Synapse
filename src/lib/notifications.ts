import { triggerUserNotification } from '@/lib/pusher-server';
import webPush from '@/lib/web-push';
import { prisma } from '@/lib/prisma';

interface SendNotificationParams {
  email: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

export async function sendNotification({
  email,
  title,
  body,
  data = {},
  options = {},
}: SendNotificationParams) {
  const results: { pusher: boolean; push: number } = { pusher: false, push: 0 };

  // 1. Pusher — for when the user has the app open
  results.pusher = await triggerUserNotification(email, 'notification', {
    title, body, data, options,
  });

  // 2. Push Notification — for when the app is backgrounded/closed
  if (!webPush) return results;

  try {
    const subs = await prisma.pushSubscription.findMany({ where: { email } });

    const payload = JSON.stringify({
      title, body, data, options,
    });

    const sent = await Promise.allSettled(
      subs.map(sub =>
        webPush!.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        }, payload)
      )
    );

    // Clean up expired subscriptions (410 Gone)
    for (let i = 0; i < sent.length; i++) {
      const r = sent[i];
      if (r.status === 'rejected') {
        const reason = r.reason as any;
        if (reason?.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: subs[i].id } }).catch(() => {});
        }
      }
    }

    results.push = sent.filter(r => r.status === 'fulfilled').length;
  } catch (err) {
    console.warn('Push notification send error:', err);
  }

  return results;
}
