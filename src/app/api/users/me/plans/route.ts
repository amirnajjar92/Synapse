import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all plans for this user
    const plans = await prisma.plan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching user plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans', details: (error as Error).message },
      { status: 500 }
    );
  }
}