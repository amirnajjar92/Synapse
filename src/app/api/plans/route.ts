import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Helper to get or create test user
const getTestUser = async () => {
  let user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    })
  }
  if (!user.email) {
    throw new Error('User email not found')
  }
  return user
}

export async function GET(request: Request) {
  const user = await getTestUser()

  const userWithPlans = await prisma.user.findUnique({
    where: { email: user.email as string },
    include: { plans: { include: { tables: { include: { rows: true } } } } },
  })

  return NextResponse.json({ plans: userWithPlans?.plans || [] })
}

export async function POST(request: Request) {
  console.log('POST /api/plans request received');
  try {
    const { title, prompt, icon, tables } = await request.json()
    console.log('Request data:', { title, prompt, icon, tablesCount: tables?.length });

    const user = await getTestUser()
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
