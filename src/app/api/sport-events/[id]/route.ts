import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const event = await prisma.sportEvent.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        engagements: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error getting event:', error)
    return NextResponse.json({ error: 'Failed to get event' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { title, description, date, location, locationLat, locationLng, maxParticipants, hostedBy, coverImage, sponsors, status, userEmail } = await request.json()
    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 })
    }

    const event = await prisma.sportEvent.findUnique({ where: { id } })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } })
    if (!user || event.creatorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await prisma.sportEvent.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(location !== undefined && { location }),
        ...(locationLat !== undefined && { locationLat: locationLat ? parseFloat(locationLat) : null }),
        ...(locationLng !== undefined && { locationLng: locationLng ? parseFloat(locationLng) : null }),
        ...(maxParticipants !== undefined && { maxParticipants: maxParticipants ? parseInt(maxParticipants) : null }),
        ...(hostedBy !== undefined && { hostedBy }),
        ...(coverImage !== undefined && { coverImage }),
        ...(sponsors !== undefined && { sponsors: typeof sponsors === 'string' ? sponsors : JSON.stringify(sponsors) }),
        ...(status !== undefined && { status }),
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        engagements: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    return NextResponse.json({ event: updated })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')

    if (!userEmail) {
      return NextResponse.json({ error: 'userEmail is required' }, { status: 400 })
    }

    const event = await prisma.sportEvent.findUnique({ where: { id } })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } })
    if (!user || event.creatorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.sportEvent.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
