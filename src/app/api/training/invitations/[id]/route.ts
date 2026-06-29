import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { email, status } = await request.json();

  if (!email || !status) {
    return NextResponse.json({ error: 'email and status are required' }, { status: 400 });
  }

  if (!['ACCEPTED', 'DECLINED'].includes(status)) {
    return NextResponse.json({ error: 'Status must be ACCEPTED or DECLINED' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }

  if (invitation.clientEmail !== email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (invitation.status !== 'PENDING') {
    return NextResponse.json({ error: 'Invitation already processed' }, { status: 400 });
  }

  // Update invitation status
  const updated = await prisma.invitation.update({
    where: { id },
    data: { status },
  });

  // If accepted, create trainer-client link and conversation
  if (status === 'ACCEPTED') {
    const client = await prisma.user.findUnique({ where: { email } });

    if (client) {
      await prisma.trainerClient.upsert({
        where: {
          trainerId_clientId: {
            trainerId: invitation.trainerId,
            clientId: client.id,
          },
        },
        update: { planStatus: 'NONE' },
        create: {
          trainerId: invitation.trainerId,
          clientId: client.id,
          planStatus: 'NONE',
        },
      });

      // Auto-create conversation
      await prisma.conversation.upsert({
        where: {
          trainerId_clientId: {
            trainerId: invitation.trainerId,
            clientId: client.id,
          },
        },
        update: {},
        create: {
          trainerId: invitation.trainerId,
          clientId: client.id,
        },
      });
    }
  }

  return NextResponse.json({ invitation: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }

  // Only the trainer who sent it can cancel
  if (invitation.trainerId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await prisma.invitation.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
