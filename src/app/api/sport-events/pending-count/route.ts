import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get('userEmail')
    if (!userEmail) {
      return NextResponse.json({ count: 0 })
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } })
    if (!user) {
      return NextResponse.json({ count: 0 })
    }

    const count = await prisma.eventEngagement.count({
      where: {
        status: 'PENDING',
        event: { creatorId: user.id },
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error fetching pending event count:', error)
    return NextResponse.json({ count: 0 })
  }
}
