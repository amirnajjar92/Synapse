import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
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

    // Get all prompts for the user
    const prompts = await prisma.userPrompt.findMany({
      where: { userId },
      include: {
        plan: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`[Admin] Fetching prompts for userId: ${userId}, found ${prompts.length} prompts`);

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error fetching user prompts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
