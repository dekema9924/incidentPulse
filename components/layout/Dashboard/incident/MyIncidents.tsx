'use client'

import { useEffect, useState } from 'react'
import { useDashboardContext } from '@/context/DashboardContext'
import { getMyIncidents, type IncidentListItem } from '@/src/lib/dashboard/incident-actions'
import Pagination from '@/components/ui/Pagination'

const PAGE_SIZE = 10

type Status = IncidentListItem['status']
type Severity = IncidentListItem['severity']

const STATUS_PILL: Record<Status, string> = {
    Investigating: 'text-[#E5484D] border-[#4a2124]',
    Identified: 'text-[#F5A524] border-[#4a3a1a]',
    Monitoring: 'text-[#5B8DEF] border-[#233a5c]',
    Resolved: 'text-[#3DD68C] border-[#1d4b3a]',
}

const SEV_DOT: Record<Severity, string> = {
    P1: 'bg-[#E5484D]',
    P2: 'bg-[#F5A524]',
    P3: 'bg-[#5B8DEF]',
}

// "9d ago" reads better than "219h 11m ago"
const timeAgo = (ts: number) => {
    const mins = Math.max(0, Math.floor((Date.now() - ts) / 60000))
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ${mins % 60}m ago`
    return `${Math.floor(hours / 24)}d ago`
}

// open incidents first; the sort is stable, so each group keeps the server's newest-first order
const openFirst = (a: IncidentListItem, b: IncidentListItem) =>
    Number(a.status === 'Resolved') - Number(b.status === 'Resolved')

function MyIncidents() {
    const { org } = useDashboardContext()

    const [mine, setMine] = useState<IncidentListItem[] | null>(null) // null = still loading
    const [error, setError] = useState(false)
    const [page, setPage] = useState(1)
    const [version, setVersion] = useState(0) // bump to refetch

    useEffect(() => {
        let cancelled = false
        setError(false)

        getMyIncidents(org.slug)
            .then(d => { if (!cancelled) setMine([...d].sort(openFirst)) })
            .catch(e => {
                console.error('getMyIncidents failed', e)
                if (!cancelled) {
                    setMine([])
                    setError(true)
                }
            })

        return () => { cancelled = true }
    }, [org.slug, version])

    const total = mine?.length ?? 0
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const safePage = Math.min(page, pageCount) // the list can shrink after a refetch
    const rows = (mine ?? []).slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

    return (
        <section>
            <h1 className="text-2xl font-semibold">My Incidents</h1>
            <p className="secondary-text mt-1 text-xs">Assigned to you in {org.name}.</p>

            <div className="mt-5 overflow-hidden rounded-xl border border-[#262B36] bg-[#15181F]">
                <table className="w-full text-left text-[13px]">
                    <thead>
                        <tr className="border-b border-[#262B36] text-[11px] text-[#868C9C]">
                            <th className="px-4 py-3 font-semibold">Incident</th>
                            <th className="hidden px-4 py-3 font-semibold sm:table-cell">Severity</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="hidden px-4 py-3 font-semibold sm:table-cell">Opened</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* loading skeleton */}
                        {mine === null &&
                            [0, 1, 2].map(i => (
                                <tr key={i} className="border-b border-[#262B36] last:border-0">
                                    <td className="px-4 py-4"><div className="h-4 w-3/4 animate-pulse rounded bg-[#1B1F28]" /></td>
                                    <td className="hidden px-4 py-4 sm:table-cell"><div className="h-4 w-8 animate-pulse rounded bg-[#1B1F28]" /></td>
                                    <td className="px-4 py-4"><div className="h-4 w-16 animate-pulse rounded bg-[#1B1F28]" /></td>
                                    <td className="hidden px-4 py-4 sm:table-cell"><div className="h-4 w-20 animate-pulse rounded bg-[#1B1F28]" /></td>
                                </tr>
                            ))}

                        {/* incidents */}
                        {rows.map(inc => (
                            <tr key={inc.id} className="border-b border-[#262B36] transition-colors last:border-0 hover:bg-[#1B1F28]/60">
                                <td className="px-4 py-3.5">
                                    <p className="font-medium leading-snug">{inc.title}</p>
                                    {/* on phones the hidden columns move under the title */}
                                    <p className="mt-1 font-mono text-[11px] text-[#868C9C] sm:hidden">
                                        {inc.code} · {inc.severity} · {timeAgo(inc.opened)}
                                    </p>
                                </td>

                                <td className="hidden px-4 py-3.5 sm:table-cell">
                                    <span className="inline-flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${SEV_DOT[inc.severity]}`} />
                                        {inc.severity}
                                    </span>
                                </td>

                                <td className="px-4 py-3.5">
                                    <span className={`inline-flex items-center rounded-full border px-2 py-px text-[10px] font-medium ${STATUS_PILL[inc.status]}`}>
                                        {inc.status}
                                    </span>
                                </td>

                                <td className="hidden whitespace-nowrap px-4 py-3.5 text-[#E7E9EE] sm:table-cell">
                                    {timeAgo(inc.opened)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* empty state */}
                {mine !== null && mine.length === 0 && !error && (
                    <div className="px-4 py-12 text-center">
                        <p className="text-[13px] font-medium">Nothing assigned to you</p>
                        <p className="secondary-text mx-auto mt-1 max-w-xs text-xs">
                            Incidents an admin assigns to you, or approves your request for, show up here.
                        </p>
                    </div>
                )}

                {/* error state */}
                {error && (
                    <div className="px-4 py-12 text-center">
                        <p className="text-[13px] font-medium">Could not load your incidents</p>
                        <button
                            type="button"
                            onClick={() => { setMine(null); setVersion(v => v + 1) }}
                            className="mt-3 rounded-md border border-[#262B36] bg-[#1B1F28] px-3 py-1.5 text-xs hover:border-[#3a4152]"
                        >
                            Try again
                        </button>
                    </div>
                )}

                <Pagination
                    page={safePage}
                    pageCount={pageCount}
                    onPageChange={setPage}
                    totalItems={total}
                    pageSize={PAGE_SIZE}
                    className="border-t border-[#262B36] px-4 py-3"
                />
            </div>
        </section>
    )
}

export default MyIncidents