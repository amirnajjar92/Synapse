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
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, prompt, icon, tables } = await request.json()

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

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

  return NextResponse.json({ plan })
}
