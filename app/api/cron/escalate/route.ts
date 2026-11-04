// app/api/cron/escalate/route.ts
import { runEscalationCheck } from '@/src/lib/escalation'
import { NextResponse } from 'next/server'


export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const secret = process.env.CRON_SECRET

    // the !secret check matters: without it, an unset variable would accept "Bearer undefined"
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await runEscalationCheck()
    return NextResponse.json({ ok: true })
}