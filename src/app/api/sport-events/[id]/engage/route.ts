import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { userEmail, userName, guestEmail, guestPhone, guestLinks } = await request.json()

    const email = userEmail || guestEmail
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const event = await prisma.sportEvent.findUnique({ where: { id } })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Event is not active' }, { status: 400 })
    }

    // Check if guest email already joined
    if (!userEmail && guestEmail) {
      const existing = await prisma.eventEngagement.findUnique({
        where: { eventId_guestEmail: { eventId: id, guestEmail } },
      })
      if (existing) {
        if (existing.status === 'DECLINED') {
          const updated = await prisma.eventEngagement.update({
            where: { id: existing.id },
            data: { status: 'PENDING' },
          })
          return NextResponse.json({ engagement: updated, guest: true })
        }
        return NextResponse.json({ engagement: existing, guest: true })
      }
    }

    // System user path
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const existing = await prisma.eventEngagement.findUnique({
        where: { eventId_userId: { eventId: id, userId: user.id } },
      })

      if (existing) {
        if (existing.status === 'DECLINED') {
          const updated = await prisma.eventEngagement.update({
            where: { id: existing.id },
            data: { status: 'PENDING' },
            include: { user: { select: { id: true, name: true, email: true } } },
          })
          return NextResponse.json({ engagement: updated })
        }
        return NextResponse.json({ engagement: existing })
      }

      if (event.maxParticipants) {
        const approvedCount = await prisma.eventEngagement.count({
          where: { eventId: id, status: 'APPROVED' },
        })
        if (approvedCount >= event.maxParticipants) {
          return NextResponse.json({ error: 'Event is full' }, { status: 400 })
        }
      }

      const engagement = await prisma.eventEngagement.create({
        data: { eventId: id, userId: user.id },
        include: { user: { select: { id: true, name: true, email: true } } },
      })

      return NextResponse.json({ engagement })
    }

    // Guest path
    if (event.maxParticipants) {
      const approvedCount = await prisma.eventEngagement.count({
        where: { eventId: id, status: 'APPROVED' },
      })
      if (approvedCount >= event.maxParticipants) {
        return NextResponse.json({ error: 'Event is full' }, { status: 400 })
      }
    }

    const engagement = await prisma.eventEngagement.create({
      data: {
        eventId: id,
        guestEmail,
        guestPhone: guestPhone || null,
        guestLinks: guestLinks || null,
      },
    })

    return NextResponse.json({ engagement, guest: true })
  } catch (error) {
    console.error('Error engaging with event:', error)
    return NextResponse.json({ error: 'Failed to engage' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    const guestEmail = searchParams.get('guestEmail')

    if (!userEmail && !guestEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      await prisma.eventEngagement.deleteMany({
        where: { eventId: id, userId: user.id },
      })
    } else if (guestEmail) {
      await prisma.eventEngagement.deleteMany({
        where: { eventId: id, guestEmail },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing engagement:', error)
    return NextResponse.json({ error: 'Failed to remove engagement' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { userEmail, engagementId, status, isApproval } = await request.json()

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 })
    }

    const event = await prisma.sportEvent.findUnique({ where: { id } })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (isApproval) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } })
      if (!user || event.creatorId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    const updated = await prisma.eventEngagement.update({
      where: { id: engagementId },
      data: { status },
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json({ engagement: updated })
  } catch (error) {
    console.error('Error updating engagement:', error)
    return NextResponse.json({ error: 'Failed to update engagement' }, { status: 500 })
  }
}
