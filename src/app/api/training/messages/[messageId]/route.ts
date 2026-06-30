import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import pusherServer from '@/lib/pusher-server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  if (message.senderId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await prisma.message.delete({ where: { id: messageId } });

  if (pusherServer) {
    try {
      await pusherServer.trigger(`chat-${message.conversationId}`, 'message-deleted', {
        messageId,
      });
    } catch (e) {
      console.error('Pusher trigger failed (non-fatal):', e);
    }
  }

  return NextResponse.json({ success: true });
}
