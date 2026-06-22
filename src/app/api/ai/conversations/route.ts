import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Retrieve user's conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '50');
    const conversationId = searchParams.get('conversationId');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get or create user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get specific conversation or recent conversations
    if (conversationId) {
      const conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return NextResponse.json({
        success: true,
        conversation,
      });
    } else {
      // Get recent conversations
      const conversations = await prisma.aIConversation.findMany({
        where: { userId: user.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 5, // Last 5 messages per conversation for preview
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });

      return NextResponse.json({
        success: true,
        conversations,
      });
    }
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conversations' },
      { status: 500 }
    );
  }
}

// POST - Save a conversation message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      conversationId,
      sessionId,
      role,
      content,
      intent,
      confidence,
      contextPage,
      metadata,
    } = body;

    if (!email || !role || !content) {
      return NextResponse.json(
        { error: 'Email, role, and content are required' },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          updatedAt: new Date(),
        },
      });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aIConversation.findUnique({
        where: { id: conversationId },
      });
    }

    if (!conversation) {
      conversation = await prisma.aIConversation.create({
        data: {
          userId: user.id,
          sessionId: sessionId || null,
        },
      });
    }

    // Create message
    const message = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role,
        content,
        intent: intent || null,
        confidence: confidence || null,
        contextPage: contextPage || null,
        metadata: metadata || null,
      },
    });

    // Update conversation timestamp
    await prisma.aIConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error('Save message error:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a conversation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const email = searchParams.get('email');

    if (!conversationId || !email) {
      return NextResponse.json(
        { error: 'Conversation ID and email are required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.userId !== user.id) {
      return NextResponse.json(
        { error: 'Conversation not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete conversation (messages will be cascade deleted)
    await prisma.aIConversation.delete({
      where: { id: conversationId },
    });

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted',
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}
