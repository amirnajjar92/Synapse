import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendNotification } from '@/lib/notifications'
import { sendEventEmail, joinRequestEmail, approvalEmail } from '@/lib/email'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://synapse-fit.vercel.app'

function formatDate(dateStr: string | Date) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { userEmail, userName, guestEmail, guestPhone, guestLinks } = await request.json()

    const email = userEmail || guestEmail
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const event = await prisma.sportEvent.findUnique({
      where: { id },
      include: { creator: { select: { id: true, name: true, email: true } } },
    })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Event is not active' }, { status: 400 })
    }

    const requesterName = userName || guestEmail || 'Someone'
    const notifyCreator = async () => {
      const dateStr = formatDate(event.date)
      const approveUrl = `${APP_URL}/training-studio?tab=events`
      const engageUrl = `${APP_URL}/sport-events/${event.id}`

      // Push notification + email to creator
      if (event.creator.email) {
        sendNotification({
          email: event.creator.email,
          title: 'New Join Request',
          body: `${requesterName} wants to join "${event.title}"`,
          data: { url: engageUrl, type: 'event_join_request' },
        }).catch(() => {})

        sendEventEmail({
          to: event.creator.email,
          subject: `New Join Request — ${event.title}`,
          html: joinRequestEmail({
            creatorName: event.creator.name || 'there',
            eventTitle: event.title,
            requesterName,
            eventDate: dateStr,
            eventLocation: event.location || '',
            approveUrl,
          }),
        }).catch(() => {})
      }
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
          await notifyCreator()
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
          await notifyCreator()
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

      await notifyCreator()
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

    await notifyCreator()

    // Confirmation email to guest
    sendEventEmail({
      to: guestEmail!,
      subject: `Request Sent — ${event.title}`,
      html: approvalEmail({
        eventTitle: event.title,
        status: 'APPROVED',
        eventDate: formatDate(event.date),
        eventLocation: event.location || '',
      }).replace("Great news! Your request to join has been approved.", "Your request to join has been sent. You'll be notified once the host reviews it."),
    }).catch(() => {})

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

    const event = await prisma.sportEvent.findUnique({
      where: { id },
      include: { creator: { select: { id: true, name: true, email: true } } },
    })
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

    // Notify the participant about approval/declinement
    const recipientEmail = updated.user?.email || updated.guestEmail
    if (recipientEmail && (status === 'APPROVED' || status === 'DECLINED')) {
      const engageUrl = `${APP_URL}/sport-events/${event.id}`

      // Push notification to participant
      sendNotification({
        email: recipientEmail,
        title: status === 'APPROVED' ? 'You\'re In!' : 'Request Update',
        body: status === 'APPROVED'
          ? `Your request to join "${event.title}" was approved!`
          : `Your request to join "${event.title}" was declined.`,
        data: { url: engageUrl, type: 'event_engagement_update' },
      }).catch(() => {})

      // Email to participant (both system users and guests)
      sendEventEmail({
        to: recipientEmail,
        subject: status === 'APPROVED'
          ? `You're In — ${event.title}`
          : `Request Update — ${event.title}`,
        html: approvalEmail({
          eventTitle: event.title,
          status: status as 'APPROVED' | 'DECLINED',
          eventDate: formatDate(event.date),
          eventLocation: event.location || '',
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ engagement: updated })
  } catch (error) {
    console.error('Error updating engagement:', error)
    return NextResponse.json({ error: 'Failed to update engagement' }, { status: 500 })
  }
}
