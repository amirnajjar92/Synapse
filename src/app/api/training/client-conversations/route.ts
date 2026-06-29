import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import pusherServer from '@/lib/pusher-server';

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

  const trainerClients = await prisma.trainerClient.findMany({
    where: { clientId: user.id },
    include: {
      trainer: true,
      assignedPlan: { select: { id: true, title: true } },
    },
  });

  const conversations = await Promise.all(
    trainerClients.map(async (tc) => {
      const conversation = await prisma.conversation.findUnique({
        where: {
          trainerId_clientId: {
            trainerId: tc.trainerId,
            clientId: user.id,
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { sender: true },
          },
        },
      });

      const messages = (conversation?.messages || []).map((msg) => ({
        id: msg.id,
        senderId: msg.senderId === user.id ? 'me' : 'trainer',
        senderName: msg.sender.name,
        text: msg.text,
        timestamp: msg.createdAt.toISOString(),
      }));

      return {
        conversationId: conversation?.id || null,
        trainer: {
          id: tc.trainer.id,
          name: tc.trainer.name,
          email: tc.trainer.email,
          image: tc.trainer.image,
        },
        assignedPlan: tc.assignedPlan
          ? { id: tc.assignedPlan.id, title: tc.assignedPlan.title }
          : null,
        messages,
      };
    })
  );

  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const { email, trainerId, text } = await request.json();

  if (!email || !trainerId || !text) {
    return NextResponse.json({ error: 'email, trainerId, and text are required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  let conversation = await prisma.conversation.findUnique({
    where: {
      trainerId_clientId: {
        trainerId,
        clientId: user.id,
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        trainerId,
        clientId: user.id,
      },
    });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: user.id,
      text,
    },
    include: { sender: true },
  });

  // Trigger Pusher for real-time delivery
  if (pusherServer) {
    try {
      await pusherServer.trigger(`chat-${conversation.id}`, 'new-message', {
        id: message.id,
        senderId: message.senderId,
        senderName: message.sender.name,
        text: message.text,
        timestamp: message.createdAt.toISOString(),
      });
    } catch (e) {
      console.error('Pusher trigger failed (non-fatal):', e);
    }
  }

  return NextResponse.json({
    message: {
      id: message.id,
      senderId: 'me',
      senderName: message.sender.name,
      text: message.text,
      timestamp: message.createdAt.toISOString(),
    },
  }, { status: 201 });
}
