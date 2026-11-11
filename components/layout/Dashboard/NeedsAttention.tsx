

'use client'

import { CircleCheck } from 'lucide-react'
import type { IncidentListItem } from '@/src/lib/dashboard/incident-actions'

// only the fields this card needs, so the real IncidentListItem[] fits as-is
export type AttentionItem = Pick<
    IncidentListItem,
    'id' | 'code' | 'title' | 'severity' | 'status' | 'assignee' | 'opened' | 'escalated'
>

type Props = {
    orgName: string
    incidents: AttentionItem[] | null   // null = loading
    limit?: number
    onSelect?: (id: string) => void
    onViewAll?: () => void
}

const STATUS_PILL: Record<AttentionItem['status'], string> = {
    Investigating: 'border-[#4a2124] bg-[#E5484D]/10 text-[#E5484D]',
    Identified: 'border-[#4a3a1a] bg-[#F5A524]/10 text-[#F5A524]',
    Monitoring: 'border-[#233a5c] bg-[#5B8DEF]/10 text-[#5B8DEF]',
    Resolved: 'border-[#1d4b3a] bg-[#3DD68C]/10 text-[#3DD68C]',
}

const SEVERITY_RANK = { P1: 0, P2: 1, P3: 2 } as const

//  already-escalated, then by severity, then whatever has waited longest
const byUrgency = (a: AttentionItem, b: AttentionItem) =>
    Number(b.escalated) - Number(a.escalated) ||
    SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
    a.opened - b.opened

export default function NeedsAttention({ orgName, incidents, limit = 5, onSelect, onViewAll }: Props) {
    const open = (incidents ?? []).filter(i => i.status !== 'Resolved').sort(byUrgency)
    const shown = open.slice(0, limit)
    const hiddenCount = open.length - shown.length

    return (
        <section className="rounded-xl border border-[#262B36] bg-[#15181F]">
            <div className="p-4 pb-3">
                <h2 className="text-[15px] font-semibold">Needs attention</h2>
                <p className="mt-0.5 text-xs text-[#868C9C]">Open incidents in {orgName}.</p>
            </div>

            <ul className="px-4">
                {/* loading */}
                {incidents === null &&
                    [0, 1, 2].map(i => (
                        <li key={i} className="flex items-center justify-between gap-3 border-t border-[#262B36] py-3">
                            <div className="flex-1 space-y-2">
                                <div className="h-3.5 w-1/2 animate-pulse rounded bg-[#1B1F28]" />
                                <div className="h-3 w-1/3 animate-pulse rounded bg-[#1B1F28]" />
                            </div>
                            <div className="h-5 w-20 animate-pulse rounded bg-[#1B1F28]" />
                        </li>
                    ))}

                {/* incidents */}
                {shown.map(inc => (
                    <li key={inc.id} className="border-t border-[#262B36]">
                        <button
                            type="button"
                            onClick={() => onSelect?.(inc.id)}
                            className="-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-[#1B1F28]/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B8DEF]"
                        >
                            <span className="min-w-0">
                                <span className="block truncate text-[13px] font-medium">{inc.title}</span>
                                <span className="mt-0.5 block truncate font-mono text-[11px] text-[#868C9C]">
                                    {inc.code} · {inc.severity} · {inc.assignee ?? 'Unassigned'}
                                </span>
                            </span>

                            <span className="flex shrink-0 items-center gap-2">
                                {inc.escalated && (
                                    <span className="hidden rounded-md bg-[#E5484D]/15 px-1.5 py-px text-[10px] font-medium text-[#E5484D] sm:inline">
                                        Escalated
                                    </span>
                                )}
                                <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${STATUS_PILL[inc.status]}`}>
                                    {inc.status}
                                </span>
                            </span>
                        </button>
                    </li>
                ))}
            </ul>

            {/* empty */}
            {incidents !== null && open.length === 0 && (
                <div className="flex flex-col items-center gap-2 border-t border-[#262B36] px-4 py-10 text-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B1F28] text-[#3DD68C]">
                        <CircleCheck className="h-4 w-4" />
                    </span>
                    <p className="text-[13px] font-medium">All clear</p>
                    <p className="text-xs text-[#868C9C]">Nothing is open right now.</p>
                </div>
            )}

            {/* footer */}
            {hiddenCount > 0 && (
                <div className="border-t border-[#262B36] px-4 py-3">
                    <button
                        type="button"
                        onClick={onViewAll}
                        className="text-xs font-medium text-[#5B8DEF] hover:underline"
                    >
                        View all {open.length} open incidents
                    </button>
                </div>
            )}
        </section>
    )
}