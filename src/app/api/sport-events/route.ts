import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

const getOrCreateUser = async (email: string) => {
  if (!email) throw new Error('Email is required')
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: { email, name: 'User', updatedAt: new Date() },
    })
  }
  return user
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    const upcoming = searchParams.get('upcoming') === 'true'

    const where: any = {}
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } })
      if (user) where.creatorId = user.id
    }
    if (upcoming) {
      where.date = { gte: new Date() }
      where.status = 'ACTIVE'
    }

    const events = await prisma.sportEvent.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        engagements: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error getting events:', error)
    return NextResponse.json({ events: [] })
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, date, location, locationLat, locationLng, maxParticipants, userEmail } = await request.json()
    if (!userEmail || !title || !date) {
      return NextResponse.json({ error: 'userEmail, title, and date are required' }, { status: 400 })
    }

    const user = await getOrCreateUser(userEmail)
    const event = await prisma.sportEvent.create({
      data: {
        creatorId: user.id,
        title,
        description,
        date: new Date(date),
        location,
        locationLat: locationLat ? parseFloat(locationLat) : null,
        locationLng: locationLng ? parseFloat(locationLng) : null,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        engagements: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event', details: String(error) }, { status: 500 })
  }
}
