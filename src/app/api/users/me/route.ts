import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, name, picture } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find existing user or create new one
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image: picture || null,
        },
      });
    } else {
      // Update user info if needed
      user = await prisma.user.update({
        where: { email },
        data: {
          name: name || user.name,
          image: picture || user.image,
        },
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error handling user:', error);
    return NextResponse.json(
      { error: 'Failed to handle user', details: String(error) },
      { status: 500 }
    );
  }
}
