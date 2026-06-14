import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/../auth'
import prisma from '@/lib/db'

async function getUserFromRequest(request: Request) {
  // Check NextAuth session first
  const session = await getServerSession(authOptions)
  if (session?.user?.email) {
    return await prisma.user.findUnique({
      where: { email: session.user.email },
    })
  }

  // If no session, try to get email from query params first for GET requests
  const { searchParams } = new URL(request.url)
  const emailFromQuery = searchParams.get('email')
  if (emailFromQuery) {
    return await prisma.user.findUnique({
      where: { email: emailFromQuery },
    })
  }

  // If no query param, try to get email from request body for POST/PUT/DELETE
  try {
    const body = await request.json().catch(() => null)
    if (body?.email) {
      return await prisma.user.findUnique({
        where: { email: body.email },
      })
    }
  } catch (e) {
    // Do nothing
  }

  return null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getUserFromRequest(request)
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: { tables: { include: { rows: true } } },
  })

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  if (plan.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  return NextResponse.json({ plan })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getUserFromRequest(request)
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plan = await prisma.plan.findUnique({
    where: { id },
  })

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  if (plan.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { status, startDate, endDate } = body

  const updatedPlan = await prisma.plan.update({
    where: { id },
    data: {
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  })

  return NextResponse.json({ plan: updatedPlan })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getUserFromRequest(request)
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plan = await prisma.plan.findUnique({
    where: { id },
  })

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  }

  if (plan.userId !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.plan.delete({ where: { id } })
  return NextResponse.json({ message: 'Plan deleted' })
}
