import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, endpoint, p256dh, auth } = await req.json();

    if (!email || !endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sub = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh, auth, email },
      create: { email, endpoint, p256dh, auth },
    });

    return NextResponse.json({ success: true, id: sub.id });
  } catch (err) {
    console.error('Push subscribe error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
