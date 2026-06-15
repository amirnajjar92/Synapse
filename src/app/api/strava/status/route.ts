import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/../auth'
import prisma from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ connected: false })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { accounts: true },
  })

  const isConnected = user?.accounts.some(
    (account) => account.provider === 'strava'
  )

  return NextResponse.json({ connected: !!isConnected })
}