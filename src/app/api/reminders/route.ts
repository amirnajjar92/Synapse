import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET - Fetch all reminders for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: user.id },
      orderBy: { time: 'asc' },
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

// POST - Create a new reminder
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, title, message, time, days, type } = body;

    if (!email || !title || !time || !days) {
      return NextResponse.json(
        { error: 'Email, title, time, and days are required' },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: user.id,
        title,
        message: message || null,
        time,
        days,
        type: type || 'CUSTOM',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}

// PATCH - Update a reminder
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, title, message, time, days, enabled, type } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Reminder ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (time !== undefined) updateData.time = time;
    if (days !== undefined) updateData.days = days;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (type !== undefined) updateData.type = type;

    const reminder = await prisma.reminder.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a reminder
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Reminder ID is required' },
        { status: 400 }
      );
    }

    await prisma.reminder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}
