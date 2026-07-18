import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { sessionId, entry } = await request.json()
    if (!sessionId || !entry) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // In production (Vercel read-only filesystem), skip file write and just console.log
    if (process.env.VERCEL) {
      console.log(`[PLAN-LOG:${sessionId}] [${entry.step}] +${entry.duration} |`, JSON.stringify(entry.data))
      return NextResponse.json({ ok: true })
    }

    const logsDir = path.join(process.cwd(), 'logs')
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }

    const filePath = path.join(logsDir, `plan-${sessionId}.txt`)
    const line = `[${entry.timestamp}] ${entry.step} | +${entry.duration} | ${JSON.stringify(entry.data)}\n`

    fs.appendFileSync(filePath, line)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Log write error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
