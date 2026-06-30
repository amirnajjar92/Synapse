import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import pusherServer from '@/lib/pusher-server';
import { sendNotification } from '@/lib/notifications';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      trainerId_clientId: {
        trainerId: user.id,
        clientId,
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: true },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ messages: [], conversationId: null });
  }

  const messages = conversation.messages.map((msg) => ({
    id: msg.id,
    senderId: msg.senderId === user.id ? 'trainer' : msg.senderId,
    senderName: msg.sender.name,
    text: msg.text,
    timestamp: msg.createdAt.toISOString(),
  }));

  return NextResponse.json({ messages, conversationId: conversation.id });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const { email, text } = await request.json();

  if (!email || !text) {
    return NextResponse.json({ error: 'email and text are required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      trainerId_clientId: {
        trainerId: user.id,
        clientId,
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
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
        senderEmail: message.sender.email,
        senderName: message.sender.name,
        text: message.text,
        timestamp: message.createdAt.toISOString(),
      });
    } catch (e) {
      console.error('Pusher trigger failed (non-fatal):', e);
    }
  }

  // Send push notification to the recipient
  const client = await prisma.user.findUnique({ where: { id: clientId } });
  if (client?.email) {
    sendNotification({
      email: client.email,
      title: `New message from ${message.sender.name || 'Trainer'}`,
      body: message.text.length > 120 ? message.text.slice(0, 120) + '…' : message.text,
      data: { url: `/workout-tracker?openChat=true`, type: 'chat' },
    }).catch(() => {});
  }

  return NextResponse.json({
    message: {
      id: message.id,
      senderId: 'trainer',
      senderName: message.sender.name,
      text: message.text,
      timestamp: message.createdAt.toISOString(),
    },
  }, { status: 201 });
}
