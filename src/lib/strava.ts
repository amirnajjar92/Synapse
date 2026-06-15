import prisma from '@/lib/db'

interface StravaTokenResponse {
  access_token: string
  refresh_token: string
  expires_at: number
}

export async function refreshStravaToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'strava',
    },
  })

  if (!account?.refresh_token) return null

  // Check if token is still valid (expires_at is in seconds since epoch)
  if (account.expires_at && Date.now() < account.expires_at * 1000) {
    return account.access_token
  }

  // Refresh the token
  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: account.refresh_token,
      }),
    })

    if (!response.ok) throw new Error('Failed to refresh token')

    const data: StravaTokenResponse = await response.json()

    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at,
      },
    })

    return data.access_token
  } catch (err) {
    console.error('Error refreshing Strava token:', err)
    return null
  }
}

interface StravaActivity {
  id: number
  type: string
  name: string
  start_date: string
  distance: number
  moving_time: number
  elapsed_time: number
  average_speed?: number
  max_speed?: number
  average_heartrate?: number
  max_heartrate?: number
  calories?: number
  external_id?: string
  map?: {
    summary_polyline?: string
  }
}

export async function syncStravaActivities(userId: string): Promise<void> {
  const token = await refreshStravaToken(userId)
  if (!token) throw new Error('No valid Strava token')

  // Fetch activities (last 30 days)
  const response = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?per_page=200`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )

  if (!response.ok) throw new Error('Failed to fetch activities')

  const activities: StravaActivity[] = await response.json()

  // Upsert activities
  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { stravaId: activity.id.toString() },
      update: {
        type: activity.type,
        name: activity.name,
        distance: activity.distance,
        movingTime: activity.moving_time,
        elapsedTime: activity.elapsed_time,
        averageSpeed: activity.average_speed,
        maxSpeed: activity.max_speed,
        averageHeartRate: activity.average_heartrate,
        maxHeartRate: activity.max_heartrate,
        calories: activity.calories,
        externalId: activity.external_id,
        polyline: activity.map?.summary_polyline,
      },
      create: {
        userId,
        stravaId: activity.id.toString(),
        type: activity.type,
        name: activity.name,
        startDate: new Date(activity.start_date),
        distance: activity.distance,
        movingTime: activity.moving_time,
        elapsedTime: activity.elapsed_time,
        averageSpeed: activity.average_speed,
        maxSpeed: activity.max_speed,
        averageHeartRate: activity.average_heartrate,
        maxHeartRate: activity.max_heartrate,
        calories: activity.calories,
        externalId: activity.external_id,
        polyline: activity.map?.summary_polyline,
      },
    })
  }
}