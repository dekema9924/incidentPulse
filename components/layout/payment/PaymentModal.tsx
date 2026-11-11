'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Minus, Plus } from 'lucide-react'
import { createCheckoutSession } from '@/src/lib/billing/billing-actions'
// import { createCheckoutSession } from '@/src/lib/billing-actions'

export type PaidPlan = 'TEAM' | 'LIFETIME'

const PLANS: Record<PaidPlan, { name: string; price: string; unit: string; perks: string[] }> = {
    TEAM: {
        name: 'Team',
        price: '$12',
        unit: 'per member / month',
        perks: ['Up to 5 organizations', 'Billed monthly'],
    },
    LIFETIME: {
        name: 'Lifetime',
        price: '$199',
        unit: 'one payment',
        perks: ['Unlimited organizations', 'No recurring charges'],
    },
}

const SEAT_PRICE = 12
const MIN_SEATS = 1
const MAX_SEATS = 100

export default function PaymentModal({
    initialPlan = 'TEAM',
    onClose,
}: {
    initialPlan?: PaidPlan
    onClose: () => void
}) {
    const [plan, setPlan] = useState<PaidPlan>(initialPlan)
    const [seats, setSeats] = useState(5)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) onClose()
        }
        document.addEventListener('keydown', onKey)

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = previousOverflow
        }
    }, [onClose, loading])

    const total = plan === 'TEAM' ? `$${seats * SEAT_PRICE} / month` : '$199 once'

    const handleContinue = async () => {
        setError(null)
        setLoading(true)
        try {
            const res = await createCheckoutSession({ plan, seats: plan === 'TEAM' ? seats : 1 })

            if (!res.success) {
                setError(res.error)
                setLoading(false)
                return
            }

            // leave `loading` on while the browser navigates to Stripe
            window.location.assign(res.url)
            console.log("create checkout sesison")
        } catch {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={e => {
                if (e.target === e.currentTarget && !loading) onClose()
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="payment-title"
                className="w-full max-w-md rounded-xl border border-[#262B36] bg-[#15181F] p-6 text-[#E7E9EE] shadow-2xl"
            >
                <h2 id="payment-title" className="text-base font-semibold">Upgrade your account</h2>
                <p className="mt-1 mb-5 text-xs leading-relaxed text-[#868C9C]">
                    Create your own workspaces. People you invite join as members on your plan.
                </p>

                {/* plan switch */}
                <div role="radiogroup" aria-label="Plan" className="grid grid-cols-2 gap-2">
                    {(Object.keys(PLANS) as PaidPlan[]).map(key => {
                        const p = PLANS[key]
                        const selected = plan === key

                        return (
                            <button
                                key={key}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                disabled={loading}
                                onClick={() => setPlan(key)}
                                className={`rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B8DEF] disabled:opacity-60 ${selected
                                    ? 'border-[#33477A] bg-[#243352]/60'
                                    : 'border-[#262B36] bg-[#1B1F28] hover:border-[#3a4152]'
                                    }`}
                            >
                                <span className="block text-xs font-semibold">{p.name}</span>
                                <span className="mt-1.5 block text-xl font-semibold tracking-tight">{p.price}</span>
                                <span className="block text-[11px] text-[#868C9C]">{p.unit}</span>
                            </button>
                        )
                    })}
                </div>

                {/* perks */}
                <ul className="mt-4 space-y-1.5 text-xs text-[#868C9C]">
                    {PLANS[plan].perks.map(perk => (
                        <li key={perk} className="flex items-center gap-2">
                            <Check className="h-3.5 w-3.5 shrink-0 text-[#3DD68C]" />
                            {perk}
                        </li>
                    ))}
                </ul>

                {/* seats (Team only) */}
                {plan === 'TEAM' && (
                    <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-[#262B36] bg-[#1B1F28] p-3">
                        <div>
                            <p className="text-xs font-medium">Members</p>
                            <p className="text-[11px] text-[#868C9C]">You can invite up to this many people.</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setSeats(s => Math.max(MIN_SEATS, s - 1))}
                                disabled={loading || seats <= MIN_SEATS}
                                aria-label="Fewer members"
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-[#262B36] hover:border-[#3a4152] disabled:opacity-40"
                            >
                                <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center font-mono text-sm tabular-nums" aria-live="polite">
                                {seats}
                            </span>
                            <button
                                type="button"
                                onClick={() => setSeats(s => Math.min(MAX_SEATS, s + 1))}
                                disabled={loading || seats >= MAX_SEATS}
                                aria-label="More members"
                                className="flex h-7 w-7 items-center justify-center rounded-md border border-[#262B36] hover:border-[#3a4152] disabled:opacity-40"
                            >
                                <Plus className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* total */}
                <div className="mt-5 flex items-center justify-between border-t border-[#262B36] pt-4">
                    <span className="text-xs text-[#868C9C]">
                        {plan === 'TEAM' ? `${seats} × $${SEAT_PRICE}` : 'Total'}
                    </span>
                    <span className="text-base font-semibold">{total}</span>
                </div>

                {error && <p className="mt-3 text-xs text-[#E5484D]">{error}</p>}

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-md border border-[#262B36] bg-[#1B1F28] px-4 py-2 text-[13px] hover:border-[#3a4152] disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={loading}
                        className="rounded-md border border-[#33477A] bg-[#243352] px-4 py-2 text-[13px] font-medium hover:border-[#4A63A0] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Redirecting to checkout…' : 'Continue to secure checkout'}
                    </button>
                </div>

                <p className="mt-4 text-center text-[11px] text-[#565C6B]">
                    You&apos;ll pay on Stripe&apos;s secure page. We never see or store your card details.
                </p>
            </div>
        </div>,
        document.body
    )
}