
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all daily entries for the user
    const dailyEntries = await prisma.dailyEntry.findMany({
      where: { userId: user.id },
      include: { metrics: true, media: true, plan: true },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ dailyEntries });
  } catch (error) {
    console.error('Error fetching daily entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, planId, date, notes, metrics, media } = body;

    if (!email || !planId || !date) {
      return NextResponse.json({ error: 'Email, planId, and date are required' }, { status: 400 });
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create daily entry
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);

    const dailyEntry = await prisma.dailyEntry.upsert({
      where: {
        userId_planId_date: {
          userId: user.id,
          planId,
          date: entryDate,
        },
      },
      update: {
        notes,
        metrics: metrics ? {
          deleteMany: {},
          create: metrics,
        } : undefined,
        media: media ? {
          deleteMany: {},
          create: media,
        } : undefined,
      },
      create: {
        userId: user.id,
        planId,
        date: entryDate,
        notes,
        metrics: metrics ? { create: metrics } : undefined,
        media: media ? { create: media } : undefined,
      },
      include: { metrics: true, media: true },
    });

    return NextResponse.json({ dailyEntry });
  } catch (error) {
    console.error('Error creating/updating daily entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
