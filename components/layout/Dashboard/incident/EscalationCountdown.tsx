import { useState, useEffect } from "react"

export function EscalationCountdown({ escalatesAt }: { escalatesAt: number }) {
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

    useEffect(() => {
        const tick = () => setSecondsLeft(Math.max(0, Math.ceil((escalatesAt - Date.now()) / 1000)))
        tick()
        const t = setInterval(tick, 1000)
        return () => clearInterval(t)
    }, [escalatesAt])

    if (secondsLeft === null) return null // first render only, which avoids a server/client mismatch

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