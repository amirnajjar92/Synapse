import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { session, event, data } = await request.json();
    if (!session || !event) {
      return NextResponse.json({ error: 'session and event are required' }, { status: 400 });
    }

    const log = await prisma.debugLog.create({
      data: { session, event, data: data ?? null },
    });

    return NextResponse.json({ success: true, id: log.id });
  } catch (error) {
    console.error('Error saving debug log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const logs = await prisma.debugLog.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching debug logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
