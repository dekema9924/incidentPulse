'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getPlanSummary, PlanSummary } from '@/src/lib/billing/billing-actions'
import { FREE_MEMBER_LIMIT, type PlanName } from '@/src/lib/billing/plans'
import { useOrgModalContext } from '@/context/DashboardModals'

const cardClass = 'mb-4 max-w-3xl rounded-xl border border-[#262B36] bg-[#15181F] p-5 text-[#E7E9EE]'

const PLAN_LABEL: Record<PlanName, string> = { FREE: 'Free', TEAM: 'Team', LIFETIME: 'Lifetime' }

const PLAN_BLURB: Record<PlanName, string> = {
    FREE: `1 organization and up to ${FREE_MEMBER_LIMIT} members per workspace.`,
    TEAM: 'Up to 5 organizations, billed per member each month.',
    LIFETIME: 'Unlimited organizations, paid once.',
}

const primaryBtn =
    'rounded-md border border-[#33477A] bg-[#243352] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:border-[#4A63A0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B8DEF]'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 border-t border-[#262B36] py-3 text-[13px] first:border-t-0">
            <dt className="text-[#868C9C]">{label}</dt>
            <dd className="text-right font-medium">{children}</dd>
        </div>
    )
}

function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-[#1B1F28] ${className}`} />
}

export default function Plan() {
    const { slug } = useParams<{ slug: string }>()
    const { invitesVersion, openPayment } = useOrgModalContext()

    const [summary, setSummary] = useState<PlanSummary | null>(null)
    const [error, setError] = useState(false)
    const [retry, setRetry] = useState(0)

    // refetches when an invitation is sent, so "seats left" stays current
    useEffect(() => {
        let cancelled = false
        setError(false)

        getPlanSummary(slug)
            .then(d => { if (!cancelled) setSummary(d) })
            .catch(e => {
                console.error('getPlanSummary failed', e)
                if (!cancelled) setError(true)
            })

        return () => { cancelled = true }
    }, [slug, invitesVersion, retry])

    if (error) {
        return (
            <div className={`${cardClass} text-center`}>
                <p className="text-[13px] font-medium">Could not load your plan</p>
                <button
                    type="button"
                    onClick={() => { setSummary(null); setRetry(r => r + 1) }}
                    className="mt-3 rounded-md border border-[#262B36] bg-[#1B1F28] px-3 py-1.5 text-xs hover:border-[#3a4152]"
                >
                    Try again
                </button>
            </div>
        )
    }

    if (!summary) {
        return (
            <div className={cardClass}>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-6 h-4 w-full" />
                <Skeleton className="mt-3 h-4 w-full" />
            </div>
        )
    }

    const { plan, ownedOrgs, orgLimit, isOwner, workspace } = summary

    const used = workspace ? workspace.members + workspace.pending : 0
    const pct = workspace?.limit ? Math.min(100, Math.round((used / workspace.limit) * 100)) : 0
    const full = workspace?.seatsLeft === 0
    const barColor = full ? 'bg-[#E5484D]' : pct >= 80 ? 'bg-[#F5A524]' : 'bg-[#5B8DEF]'

    return (
        <div>
            {/* ===== your plan ===== */}
            <section className={cardClass}>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs text-[#868C9C]">Your plan</p>
                        <h2 className="mt-1 text-lg font-semibold">{PLAN_LABEL[plan]}</h2>
                        <p className="mt-1 text-xs text-[#868C9C]">{PLAN_BLURB[plan]}</p>
                    </div>

                    {plan === 'FREE' && (
                        <button type="button" onClick={() => openPayment()} className={primaryBtn}>
                            Upgrade
                        </button>
                    )}
                    {plan === 'TEAM' && (
                        <button type="button" onClick={() => openPayment('LIFETIME')} className={primaryBtn}>
                            Switch to Lifetime
                        </button>
                    )}
                    {/* TODO: "Manage billing" for Team, opening Stripe's customer portal */}
                </div>

                <dl className="mt-4">
                    <Row label="Organizations you own">
                        {orgLimit === null ? `${ownedOrgs} (unlimited)` : `${ownedOrgs} of ${orgLimit}`}
                    </Row>
                </dl>
            </section>

            {/* ===== workspace seats: owners and admins only ===== */}
            {workspace && (
                <section className={cardClass}>
                    <h2 className="text-[15px] font-semibold">Workspace seats</h2>
                    <p className="mt-1 text-xs text-[#868C9C]">
                        This workspace runs on the owner&apos;s {PLAN_LABEL[workspace.plan]} plan.
                    </p>

                    {workspace.limit !== null && (
                        <div className="mt-4">
                            <div
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={workspace.limit}
                                aria-valuenow={Math.min(used, workspace.limit)}
                                aria-label="Seats used"
                                className="h-2 overflow-hidden rounded-full bg-[#1B1F28]"
                            >
                                <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                            </div>
                            <p className="mt-2 text-xs text-[#868C9C]">
                                {used} of {workspace.limit} seats used
                            </p>
                        </div>
                    )}

                    <dl className="mt-3">
                        <Row label="Members">{workspace.members}</Row>
                        <Row label="Pending invitations">{workspace.pending}</Row>
                        <Row label="Seats left">
                            {workspace.seatsLeft === null ? (
                                'Unlimited'
                            ) : (
                                <span className={full ? 'text-[#E5484D]' : 'text-[#3DD68C]'}>{workspace.seatsLeft}</span>
                            )}
                        </Row>
                    </dl>

                    {full && (
                        <div className="mt-3 flex flex-col gap-3 rounded-md border border-[#4a2124] bg-[#E5484D]/10 p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[#E7E9EE]">
                                {isOwner
                                    ? 'This workspace is full. Add seats to invite more people.'
                                    : 'This workspace is full. Ask the owner to add seats.'}
                            </p>
                            {isOwner && workspace.plan === 'FREE' && (
                                <button type="button" onClick={() => openPayment()} className={`${primaryBtn} shrink-0`}>
                                    Upgrade
                                </button>
                            )}
                        </div>
                    )}
                </section>
            )}
        </div>
    )
}