import { NextResponse } from 'next/server'
import { healthCheck } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const healthy = await healthCheck()

    if (!healthy) {
      return NextResponse.json(
        { ok: false, message: 'database_unreachable' },
        { status: 503 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error'
    return NextResponse.json(
      { ok: false, message },
      { status: 503 }
    )
  }
}
