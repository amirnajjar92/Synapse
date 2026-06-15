import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/../auth'
import prisma from '@/lib/db'
import { syncStravaActivities } from '@/lib/strava'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    await syncStravaActivities(user.id)
    return NextResponse.json({ success: true, message: 'Activities synced' })
  } catch (err) {
    console.error('Error syncing Strava activities:', err)
    return NextResponse.json(
      { error: 'Failed to sync activities' },
      { status: 500 }
    )
  }
}