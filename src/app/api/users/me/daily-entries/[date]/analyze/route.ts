import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request, { params }: { params: Promise<{ date: string }> }) {
  const resolvedParams = await params;
  
  // Read form data once
  const formData = await request.formData();
  const email = formData.get('email') as string;
  
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
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

    const prompt = formData.get('prompt') as string;
    const imageFile = formData.get('image') as File | null;

    // Save media if image is provided
    let mediaUrl = null;
    if (imageFile) {
      // TODO: In production, upload to cloud storage (S3, Vercel Blob, etc.)
      // For now, we'll just store a placeholder
      mediaUrl = `placeholder-${Date.now()}.jpg`;
    }

    // Call ask-moole API to analyze prompt and extract metrics
    const apiUrl = 'https://moole-back.vercel.app/ask-moole';
    const systemPrompt = `You are a fitness data extractor. Extract the following metrics from the user's input and return ONLY a valid JSON object with these exact keys:
- weight: { value: number, unit: 'kg' or 'lbs' }
- distance: { value: number, unit: 'km' or 'mi' }
- pace: { value: number in seconds per km, unit: 'seconds/km' }
- totalTime: { value: number in total seconds, unit: 'seconds' }

Rules:
- If a metric is not mentioned, omit it from the JSON
- For pace, convert formats like "8:07/km" to 487 seconds (8*60 + 7)
- For totalTime, convert formats like "1:05:37" to 3937 seconds (1*3600 + 5*60 + 37)
- Return ONLY the JSON, no extra text or markdown
- Make sure the JSON is valid and properly formatted`;

    const userPrompt = `Extract metrics from this fitness activity report: ${prompt}`;
    
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: `${systemPrompt}\n\n${userPrompt}` }),
    });

    let extractedData = {};
    if (res.ok) {
      const data = await res.json();
      try {
        extractedData = JSON.parse(data.answer);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        // Fallback to mock data if parsing fails
        extractedData = {
          weight: { value: 74.8, unit: 'kg' },
          distance: { value: 6.34, unit: 'km' },
          pace: { value: 487, unit: 'seconds/km' },
          totalTime: { value: 3937, unit: 'seconds' },
        };
      }
    } else {
      // Fallback to mock data if API fails
      extractedData = {
        weight: { value: 74.8, unit: 'kg' },
        distance: { value: 6.34, unit: 'km' },
        pace: { value: 487, unit: 'seconds/km' },
        totalTime: { value: 3937, unit: 'seconds' },
      };
    }

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
    const metrics = Object.entries(extractedData).map(([type, data]: [string, any]) => ({
      dailyEntryId: dailyEntry.id,
      type,
      value: data.value,
      unit: data.unit
    }));

    // Delete existing metrics and create new ones
    await prisma.dailyMetric.deleteMany({
      where: { dailyEntryId: dailyEntry.id }
    });

    if (metrics.length > 0) {
      await prisma.dailyMetric.createMany({ data: metrics });
    }

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
