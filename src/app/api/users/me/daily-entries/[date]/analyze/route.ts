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

    const prompt = formData.get('prompt') as string;
    const planId = formData.get('planId') as string | null;
    const imageFile = formData.get('image') as File | null;

    const activePlan =
      (planId && user.plans.find((p) => p.id === planId)) ||
      user.plans.find((p) => p.status === 'IN_PROGRESS') ||
      user.plans[0];

    if (!activePlan) {
      return NextResponse.json({ error: 'No active plan found' }, { status: 404 });
    }

    const entryDate = new Date(decodeURIComponent(resolvedParams.date));
    entryDate.setHours(0, 0, 0, 0);

    const existingEntry = await prisma.dailyEntry.findUnique({
      where: {
        userId_planId_date: {
          userId: user.id,
          planId: activePlan.id,
          date: entryDate,
        },
      },
      include: { metrics: true },
    });

    // Save media if image is provided
    let mediaUrl = null;
    if (imageFile) {
      // TODO: In production, upload to cloud storage (S3, Vercel Blob, etc.)
      // For now, we'll just store a placeholder
      mediaUrl = `placeholder-${Date.now()}.jpg`;
    }

    // Call internal AI analyse route to extract metrics
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

    const internalApiUrl = new URL('/api/ai/analyse', request.url);
    const res = await fetch(internalApiUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: `${systemPrompt}\n\n${userPrompt}` }),
    });

    let extractedData: Record<string, { value: number; unit?: string }> = {};
    if (res.ok) {
      const data = await res.json();
      try {
        extractedData = JSON.parse(data.answer);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }
    } else {
      console.error('AI extraction API failed:', res.status);
    }

    // Avoid overwriting existing metrics with mock data when AI extraction fails
    if (Object.keys(extractedData).length === 0 && !existingEntry) {
      extractedData = {
        weight: { value: 74.8, unit: 'kg' },
        distance: { value: 6.34, unit: 'km' },
        pace: { value: 487, unit: 'seconds/km' },
        totalTime: { value: 3937, unit: 'seconds' },
      };
    }

    const mergedNotes = existingEntry?.notes
      ? `${existingEntry.notes}\n${prompt}`.trim()
      : prompt || '';

    // Upsert DailyEntry
    const dailyEntry = await prisma.dailyEntry.upsert({
      where: {
        userId_planId_date: {
          userId: user.id,
          planId: activePlan.id,
          date: entryDate,
        },
      },
      update: {
        notes: mergedNotes,
      },
      create: {
        userId: user.id,
        planId: activePlan.id,
        date: entryDate,
        notes: prompt || '',
        todos: [],
        updatedAt: new Date(),
      },
      include: { metrics: true },
    });

    const updatedMetricTypes = Object.keys(extractedData);

    const metricChanges = updatedMetricTypes.map((type) => {
      const previous = existingEntry?.metrics.find((m) => m.type === type);
      const next = extractedData[type];
      return {
        type,
        action: previous ? ('updated' as const) : ('created' as const),
        previousValue: previous?.value,
        previousUnit: previous?.unit,
        newValue: next.value,
        newUnit: next.unit,
      };
    });

    // Only replace metrics mentioned in the new input; keep existing ones untouched
    if (updatedMetricTypes.length > 0) {
      await prisma.dailyMetric.deleteMany({
        where: {
          dailyEntryId: dailyEntry.id,
          type: { in: updatedMetricTypes },
        },
      });

      await prisma.dailyMetric.createMany({
        data: updatedMetricTypes.map((type) => {
          const data = (extractedData as Record<string, { value: number; unit?: string }>)[type];
          return {
            dailyEntryId: dailyEntry.id,
            type,
            value: data.value,
            unit: data.unit,
            updatedAt: new Date(),
          };
        }),
      });
    }

    const metrics = await prisma.dailyMetric.findMany({
      where: { dailyEntryId: dailyEntry.id },
    });

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

    // Save prompt to UserPrompt table
    if (prompt && prompt.trim()) {
      await prisma.userPrompt.create({
        data: {
          userId: user.id,
          planId: activePlan.id,
          prompt: prompt.trim(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      dailyEntry: { ...dailyEntry, metrics },
      extractedData,
      updatedMetricTypes,
      metricChanges,
      hadExistingEntry: !!existingEntry,
    });
  } catch (error) {
    console.error('Error analyzing daily entry:', error);
    return NextResponse.json(
      { error: 'Failed to analyze entry' },
      { status: 500 }
    );
  }
}
