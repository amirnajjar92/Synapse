import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/users/me/water?email=...&date=2026-06-18
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const dateStr = searchParams.get('date');

  if (!email || !dateStr) {
    return NextResponse.json({ error: 'email and date are required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const date = new Date(dateStr + 'T00:00:00.000Z');
    const log = await prisma.waterLog.findUnique({
      where: { userId_date: { userId: user.id, date } },
    });

    return NextResponse.json({ cups: log?.cups ?? 0, goalCups: log?.goalCups ?? 12 });
  } catch (error) {
    console.error('Error fetching water log:', error);
    return NextResponse.json({ error: 'Failed to fetch water log' }, { status: 500 });
  }
}

// POST /api/users/me/water — upsert cups for a date
export async function POST(request: Request) {
  try {
    const { email, date: dateStr, cups, goalCups = 12 } = await request.json();

    if (!email || !dateStr || cups === undefined) {
      return NextResponse.json({ error: 'email, date, and cups are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const date = new Date(dateStr + 'T00:00:00.000Z');

    const log = await prisma.waterLog.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: { cups, goalCups },
      create: { userId: user.id, date, cups, goalCups, updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Error saving water log:', error);
    return NextResponse.json({ error: 'Failed to save water log' }, { status: 500 });
  }
}
