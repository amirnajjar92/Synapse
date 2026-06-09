import { NextResponse } from 'next/server'
import { auth } from '@/../auth'
import prisma from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { plans: { include: { tables: { include: { rows: true } } } } },
  })

  return NextResponse.json({ plans: user?.plans || [] })
}

export async function POST(request: Request) {
  console.log('POST /api/plans request received');
  try {
    const session = await auth()
    console.log('Session:', session);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, prompt, icon, tables } = await request.json()
    console.log('Request data:', { title, prompt, icon, tablesCount: tables?.length });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    console.log('User found:', user);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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
