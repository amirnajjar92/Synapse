import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get pending invitations sent TO this user (by email)
  const invitations = await prisma.invitation.findMany({
    where: {
      clientEmail: email,
      status: 'PENDING',
    },
    include: {
      trainer: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ invitations });
}

export async function POST(request: Request) {
  const { trainerEmail, clientEmail } = await request.json();

  if (!trainerEmail || !clientEmail) {
    return NextResponse.json({ error: 'trainerEmail and clientEmail are required' }, { status: 400 });
  }

  const trainer = await prisma.user.findUnique({ where: { email: trainerEmail } });
  if (!trainer) {
    return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
  }

  // Check if client exists
  const client = await prisma.user.findUnique({ where: { email: clientEmail } });
  if (!client) {
    return NextResponse.json({ error: 'Client not found in the system' }, { status: 404 });
  }

  // Check if already linked as trainer-client
  const existingLink = await prisma.trainerClient.findUnique({
    where: {
      trainerId_clientId: {
        trainerId: trainer.id,
        clientId: client.id,
      },
    },
  });
  if (existingLink) {
    return NextResponse.json({ error: 'User is already your client' }, { status: 409 });
  }

  // Check for existing pending invitation
  const existingInvitation = await prisma.invitation.findUnique({
    where: {
      trainerId_clientEmail: {
        trainerId: trainer.id,
        clientEmail,
      },
    },
  });
  if (existingInvitation) {
    if (existingInvitation.status === 'PENDING') {
      return NextResponse.json({ error: 'Invitation already sent' }, { status: 409 });
    }
    // If ACCEPTED or DECLINED, allow re-sending
    const updated = await prisma.invitation.update({
      where: { id: existingInvitation.id },
      data: { status: 'PENDING', updatedAt: new Date() },
      include: {
        trainer: { select: { name: true, email: true } },
      },
    });
    return NextResponse.json({ invitation: updated });
  }

  const invitation = await prisma.invitation.create({
    data: {
      trainerId: trainer.id,
      clientEmail,
      status: 'PENDING',
    },
    include: {
      trainer: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ invitation }, { status: 201 });
}
