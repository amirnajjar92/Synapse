import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Helper to get or create user by email
const getOrCreateUser = async (email: string) => {
  if (!email) {
    throw new Error('Email is required')
  }
  let user = await prisma.user.findUnique({
    where: { email }
  })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'User',
        updatedAt: new Date(),
      }
    })
  }
  return user
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')

    if (!userEmail) {
      // If no userEmail, return empty array
      return NextResponse.json({ plans: [] })
    }

    const userWithPlans = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { plans: { include: { tables: { include: { rows: true } } } } },
    })

    return NextResponse.json({ plans: userWithPlans?.plans || [] })
  } catch (error) {
    console.error('Error getting plans:', error)
    return NextResponse.json({ plans: [] })
  }
}

// Helper to extract goal weight from prompt using AI
const extractGoalWeight = async (prompt: string, baseUrl: string): Promise<{ weight: number | null, unit: string | null }> => {
  try {
    // First try simple regex for common patterns
    const kgMatch = prompt.match(/(\d+(?:\.\d+)?)\s*kg/i);
    if (kgMatch) {
      return { weight: parseFloat(kgMatch[1]), unit: 'kg' };
    }
    
    const lbsMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|pounds?)/i);
    if (lbsMatch) {
      return { weight: parseFloat(lbsMatch[1]), unit: 'lbs' };
    }

    // If regex fails, use AI to extract (with OpenRouter fallback)
    const systemPrompt = `Extract the goal weight from the user's fitness prompt. Respond ONLY with a JSON object in this exact format: {"weight": number, "unit": "kg" or "lbs"}. If no goal weight is mentioned, respond with: {"weight": null, "unit": null}. Do not include any other text.`;
    
    const res = await fetch(new URL('/api/ai/analyse', baseUrl).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: `${systemPrompt}\n\nUser prompt: ${prompt}` }),
    });
    
    if (!res.ok) {
      return { weight: null, unit: null };
    }
    
    const data = await res.json();
    const answer = data.answer?.trim();
    
    // Try to parse the AI response as JSON
    const cleaned = answer.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    return {
      weight: parsed.weight ? parseFloat(parsed.weight) : null,
      unit: parsed.unit || null
    };
  } catch (err) {
    console.error('Error extracting goal weight:', err);
    return { weight: null, unit: null };
  }
};

export async function POST(request: Request) {
  console.log('POST /api/plans request received');
  try {
    const { title, prompt, icon, tables, userEmail } = await request.json()
    console.log('Request data:', { title, prompt, icon, tablesCount: tables?.length, userEmail });

    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 })
    }

    const user = await getOrCreateUser(userEmail)
    console.log('User found:', user);

    // Extract goal weight from prompt
    const { weight: goalWeight, unit: goalWeightUnit } = await extractGoalWeight(prompt, request.url);
    console.log('Extracted goal weight:', { goalWeight, goalWeightUnit });

    const plan = await prisma.plan.create({
      data: {
        userId: user.id,
        title,
        prompt,
        icon,
        goalWeight,
        goalWeightUnit,
        updatedAt: new Date(),
        tables: {
          create: tables.map((table: any) => ({
            title: table.title,
            rows: {
              create: table.rows.map((row: any) => ({
                columns: row.columns,
              })),
            },
          })),
        },
      },
      include: { tables: { include: { rows: true } } },
    })

    // Save prompt to UserPrompt table
    await prisma.userPrompt.create({
      data: {
        userId: user.id,
        planId: plan.id,
        prompt: prompt,
      },
    });

    console.log('Plan created successfully with prompt saved');
    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ error: 'Failed to create plan', details: String(error) }, { status: 500 });
  }
}
