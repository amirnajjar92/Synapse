import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST - Save a user prompt
export async function POST(request: Request) {
  try {
    const { email, prompt, planId } = await request.json();

    if (!email || !prompt) {
      return NextResponse.json({ error: 'Email and prompt are required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Save prompt to UserPrompt table
    const userPrompt = await prisma.userPrompt.create({
      data: {
        userId: user.id,
        planId: planId || null,
        prompt: prompt.trim(),
      },
    });

    return NextResponse.json({ success: true, userPrompt });
  } catch (error) {
    console.error('Error saving prompt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
