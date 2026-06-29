import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const trainer = await prisma.user.findUnique({ where: { email } });
  if (!trainer) {
    return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
  }

  const trainerClients = await prisma.trainerClient.findMany({
    where: { trainerId: trainer.id },
    include: {
      client: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get last message for each client
  const clientsWithMessages = await Promise.all(
    trainerClients.map(async (tc) => {
      const conversation = await prisma.conversation.findUnique({
        where: {
          trainerId_clientId: {
            trainerId: trainer.id,
            clientId: tc.clientId,
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      const lastMessage = conversation?.messages[0];

      return {
        id: tc.clientId,
        name: tc.client.name,
        email: tc.client.email,
        avatar: tc.client.image,
        planStatus: tc.planStatus.toLowerCase() as 'none' | 'active' | 'paused',
        lastMessage: lastMessage?.text || undefined,
        lastMessageTime: lastMessage?.createdAt.toISOString() || undefined,
        trainerClientId: tc.id,
      };
    })
  );

  return NextResponse.json({ clients: clientsWithMessages });
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

  const client = await prisma.user.findUnique({ where: { email: clientEmail } });
  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const existing = await prisma.trainerClient.findUnique({
    where: {
      trainerId_clientId: {
        trainerId: trainer.id,
        clientId: client.id,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ error: 'Client already linked' }, { status: 409 });
  }

  const trainerClient = await prisma.trainerClient.create({
    data: {
      trainerId: trainer.id,
      clientId: client.id,
      planStatus: 'NONE',
    },
    include: { client: true },
  });

  // Auto-create conversation
  await prisma.conversation.upsert({
    where: {
      trainerId_clientId: {
        trainerId: trainer.id,
        clientId: client.id,
      },
    },
    update: {},
    create: {
      trainerId: trainer.id,
      clientId: client.id,
    },
  });

  return NextResponse.json({
    client: {
      id: client.id,
      name: client.name,
      email: client.email,
      planStatus: 'none',
      trainerClientId: trainerClient.id,
    },
  }, { status: 201 });
}
