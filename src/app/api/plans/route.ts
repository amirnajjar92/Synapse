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
        name: 'User'
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

    const plan = await prisma.plan.create({
      data: {
        userId: user.id,
        title,
        prompt,
        icon,
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

    console.log('Plan created successfully');
    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ error: 'Failed to create plan', details: String(error) }, { status: 500 });
  }
}
