import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestorEmail = searchParams.get('email');

    if (!requestorEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if requestor is admin
    const requestor = await prisma.user.findUnique({
      where: { email: requestorEmail },
    });

    if (!requestor || requestor.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            userPrompts: true,
            plans: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
