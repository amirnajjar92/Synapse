import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import webPush from '@/lib/web-push';

export async function POST(req: NextRequest) {
  try {
    const { email, title, body, data, options } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    if (!webPush) {
      return NextResponse.json({ error: 'Web push not configured' }, { status: 503 });
    }

    const subs = await prisma.pushSubscription.findMany({ where: { email } });

    const payload = JSON.stringify({
      title: title || 'Synapse',
      body: body || '',
      data: data || {},
      options: options || {},
    });

    const results = await Promise.allSettled(
      subs.map(sub =>
        webPush!.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        }, payload)
      )
    );

    // Clean up invalid subscriptions
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === 'rejected' && r.reason?.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: subs[i].id } }).catch(() => {});
      }
    }

    const sent = results.filter(r => r.status === 'fulfilled').length;

    return NextResponse.json({ success: true, sent });
  } catch (err) {
    console.error('Push send error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
