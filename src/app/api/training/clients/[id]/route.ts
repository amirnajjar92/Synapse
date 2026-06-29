import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { email, planStatus, assignedPlanId } = await request.json();

  if (!email || !planStatus) {
    return NextResponse.json({ error: 'email and planStatus are required' }, { status: 400 });
  }

  const validStatuses = ['NONE', 'ACTIVE', 'PAUSED'];
  if (!validStatuses.includes(planStatus)) {
    return NextResponse.json({ error: 'Invalid planStatus' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const trainerClient = await prisma.trainerClient.findUnique({ where: { id } });
  if (!trainerClient) {
    return NextResponse.json({ error: 'TrainerClient not found' }, { status: 404 });
  }

  if (trainerClient.trainerId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const updated = await prisma.trainerClient.update({
    where: { id },
    data: {
      planStatus: planStatus as 'NONE' | 'ACTIVE' | 'PAUSED',
      ...(assignedPlanId !== undefined && { assignedPlanId }),
    },
    include: { client: true },
  });

  return NextResponse.json({
    client: {
      id: updated.clientId,
      name: updated.client.name,
      email: updated.client.email,
      planStatus: updated.planStatus.toLowerCase(),
    },
  });
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

  const trainerClient = await prisma.trainerClient.findUnique({ where: { id } });
  if (!trainerClient) {
    return NextResponse.json({ error: 'TrainerClient not found' }, { status: 404 });
  }

  if (trainerClient.trainerId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await prisma.trainerClient.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
