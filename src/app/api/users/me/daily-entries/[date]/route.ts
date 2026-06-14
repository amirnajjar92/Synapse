
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const planId = searchParams.get('planId');
    
    if (!email || !planId) {
      return NextResponse.json({ error: 'Email and planId are required' }, { status: 400 });
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse date
    const entryDate = new Date(decodeURIComponent(date));
    entryDate.setHours(0, 0, 0, 0);

    // Get daily entry
    const dailyEntry = await prisma.dailyEntry.findUnique({
      where: {
        userId_planId_date: {
          userId: user.id,
          planId,
          date: entryDate,
        },
      },
      include: { metrics: true, media: true },
    });

    return NextResponse.json({ dailyEntry });
  } catch (error) {
    console.error('Error fetching daily entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const planId = searchParams.get('planId');
    
    if (!email || !planId) {
      return NextResponse.json({ error: 'Email and planId are required' }, { status: 400 });
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse date
    const entryDate = new Date(decodeURIComponent(date));
    entryDate.setHours(0, 0, 0, 0);

    // Delete daily entry
    await prisma.dailyEntry.delete({
      where: {
        userId_planId_date: {
          userId: user.id,
          planId,
          date: entryDate,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting daily entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
