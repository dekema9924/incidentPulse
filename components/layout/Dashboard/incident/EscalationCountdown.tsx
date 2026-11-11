'use client'

import { useEffect, useRef, useState } from 'react'

export function EscalationCountdown({
    escalatesAt,
    onExpired,
}: {
    escalatesAt: number
    onExpired?: () => void
}) {
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

    useEffect(() => {
        const tick = () => setSecondsLeft(Math.max(0, Math.ceil((escalatesAt - Date.now()) / 1000)))
        tick()
        const t = setInterval(tick, 1000)
        return () => clearInterval(t)
    }, [escalatesAt])

    // always call the latest callback without restarting the timer below
    const onExpiredRef = useRef(onExpired)
    useEffect(() => { onExpiredRef.current = onExpired })

    // at zero: refetch now, then every 10 seconds until the server confirms
    const expired = secondsLeft === 0
    useEffect(() => {
        if (!expired) return
        onExpiredRef.current?.()
        const t = setInterval(() => onExpiredRef.current?.(), 10_000)
        return () => clearInterval(t)
    }, [expired])

    if (secondsLeft === null) return null

    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
    const ss = String(secondsLeft % 60).padStart(2, '0')

    return (
        <div className="mb-4 rounded-lg border border-[#4a2124] bg-[#1B1F28] p-3">
            <p className="mb-1.5 text-[11px] text-[#868C9C]">Auto-escalates to Tier 2 in</p>
            <p className="font-mono text-2xl text-[#E5484D]">
                {secondsLeft > 0 ? `${mm}:${ss}` : 'Escalating…'}
            </p>
        </div>
    )
}