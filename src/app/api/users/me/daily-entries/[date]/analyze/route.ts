import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/../auth';

export async function POST(request: Request, { params }: { params: Promise<{ date: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { plans: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current plan (first active plan or first plan)
    const currentPlan = user.plans.find(p => p.status === 'IN_PROGRESS') || user.plans[0];

    if (!currentPlan) {
      return NextResponse.json({ error: 'No active plan found' }, { status: 404 });
    }

    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const imageFile = formData.get('image') as File | null;

    // Save media if image is provided
    let mediaUrl = null;
    if (imageFile) {
      // TODO: In production, upload to cloud storage (S3, Vercel Blob, etc.)
      // For now, we'll just store a placeholder
      mediaUrl = `placeholder-${Date.now()}.jpg`;
    }

    // TODO: Call AI API to analyze prompt/image and extract metrics
    // For now, let's create a mock response
    const mockExtractedData = {
      weight: { value: 74.8, unit: 'kg' },
      distance: { value: 6.34, unit: 'km' },
      pace: { value: 487, unit: 'seconds/km' }, // 8'07" = 487 seconds
      totalTime: { value: 3937, unit: 'seconds' }, // 1:05'37" = 3937 seconds
    };

    // Upsert DailyEntry
    const dailyEntry = await prisma.dailyEntry.upsert({
      where: {
        userId_planId_date: {
          userId: user.id,
          planId: currentPlan.id,
          date: new Date(decodeURIComponent(resolvedParams.date))
        }
      },
      update: {
        notes: prompt || undefined
      },
      create: {
        userId: user.id,
        planId: currentPlan.id,
        date: new Date(decodeURIComponent(resolvedParams.date)),
        notes: prompt || '',
        todos: []
      },
      include: { metrics: true }
    });

    // Upsert metrics
    const metrics = Object.entries(mockExtractedData).map(([type, data]: [string, any]) => ({
      dailyEntryId: dailyEntry.id,
      type,
      value: data.value,
      unit: data.unit
    }));

    // Delete existing metrics and create new ones
    await prisma.dailyMetric.deleteMany({
      where: { dailyEntryId: dailyEntry.id }
    });

    await prisma.dailyMetric.createMany({ data: metrics });

    // Save media if exists
    if (mediaUrl) {
      await prisma.dailyMedia.create({
        data: {
          dailyEntryId: dailyEntry.id,
          type: 'photo',
          url: mediaUrl,
          fileName: imageFile?.name
        }
      });
    }

    return NextResponse.json({
      success: true,
      dailyEntry: { ...dailyEntry, metrics }
    });
  } catch (error) {
    console.error('Error analyzing daily entry:', error);
    return NextResponse.json(
      { error: 'Failed to analyze entry' },
      { status: 500 }
    );
  }
}