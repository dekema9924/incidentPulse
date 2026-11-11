'use client'

import { useEffect, useRef, useState } from 'react'
import { CircleCheck, PlusIcon, TriangleAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import NewIncidentForm from './NewIncidentForm'
import { useDashboardContext } from '@/context/DashboardContext'
import {
    getIncidents,
    getIncident,
    getOrgMembers,
    updateIncidentStatus,
    assignIncident,
    requestIncident,
    type IncidentListItem,
    archiveIncident,
} from '@/src/lib/dashboard/incident-actions'
import { formatTime } from '@/utils/constants'
import { EscalationCountdown } from './EscalationCountdown'

type EventType = 'msg' | 'system' | 'escalation' | 'resolve'
type Severity = IncidentListItem['severity']
type Status = IncidentListItem['status']
type Member = { id: string; name: string }
type ActionResult = { success: true } | { success: false; error: string }
type IncidentDetail = NonNullable<Awaited<ReturnType<typeof getIncident>>>
type Filter = 'open' | 'resolved' | 'all'

const matches = (i: IncidentListItem, f: Filter) =>
    f === 'all' ? true : f === 'open' ? i.status !== 'Resolved' : i.status === 'Resolved'

// Height of the three-column workspace on desktop. Adjust 8rem to match your header height plus the page padding.
const PAGE_HEIGHT = 'lg:h-[calc(100dvh-8rem)]'

const SEV_BAR: Record<Severity, string> = {
    P1: 'bg-[#E5484D]',
    P2: 'bg-[#F5A524]',
    P3: 'bg-[#5B8DEF]',
}

const SEV_BADGE: Record<Severity, string> = {
    P1: 'border-[#E5484D]/30 bg-[#E5484D]/15 text-[#E5484D]',
    P2: 'border-[#F5A524]/30 bg-[#F5A524]/15 text-[#F5A524]',
    P3: 'border-[#5B8DEF]/30 bg-[#5B8DEF]/15 text-[#5B8DEF]',
}

const STATUS_PILL: Record<Status, string> = {
    Investigating: 'text-[#E5484D] border-[#4a2124]',
    Identified: 'text-[#F5A524] border-[#4a3a1a]',
    Monitoring: 'text-[#5B8DEF] border-[#233a5c]',
    Resolved: 'text-[#3DD68C] border-[#1d4b3a]',
}

const EVENT_TEXT: Record<EventType, string> = {
    msg: 'text-[#E7E9EE]',
    system: 'text-[#F5A524]',
    escalation: 'text-[#E5484D]',
    resolve: 'text-[#3DD68C]',
}

const EVENT_BOX: Record<EventType, string> = {
    msg: '',
    system: '',
    escalation: 'rounded-md border border-[#4a2124] bg-[#E5484D]/10 px-3 py-2',
    resolve: 'rounded-md border border-[#1d4b3a] bg-[#3DD68C]/10 px-3 py-2',
}

const focusRing = 'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B8DEF]'

const selectClass = `w-full rounded-md border border-[#262B36] bg-[#1B1F28] px-2.5 py-2 text-[13px] text-[#E7E9EE] outline-none focus:border-[#5B8DEF] disabled:cursor-not-allowed disabled:opacity-50 [color-scheme:dark]`

const smallBtn = `rounded-md border border-[#262B36] bg-[#1B1F28] px-3 py-1.5 text-xs transition-colors hover:border-[#3a4152] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`

const btnSecondary = `rounded-md border border-[#33477A] bg-[#243352] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:border-[#4A63A0] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`

const btnDanger = `rounded-md border border-[#e5484d]/30 bg-[#e5484d]/20 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#e5484d]/30 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`

const btnNeutral = `rounded-md border border-[#262B36] bg-[#1B1F28] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:border-[#3a4152] ${focusRing}`

const clock = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const initials = (name: string) =>
    name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()

/* ---------- small presentational pieces ---------- */

function StatusPill({ status }: { status: Status }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2 py-px text-[10px] font-medium ${STATUS_PILL[status]}`}>
            {status}
        </span>
    )
}

function SeverityBadge({ severity }: { severity: Severity }) {
    return (
        <span className={`inline-flex items-center rounded-md border px-1.5 py-px font-mono text-[10px] font-semibold ${SEV_BADGE[severity]}`}>
            {severity}
        </span>
    )
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
    return (
        <span
            className={`flex shrink-0 items-center justify-center rounded-full bg-[#243352] font-semibold text-[#A9C0FF] ${size === 'sm' ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 text-[10px]'
                }`}
        >
            {initials(name)}
        </span>
    )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="mb-2 text-[11px] font-semibold tracking-wider text-[#565C6B]">{children}</p>
}

function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-[#1B1F28] ${className}`} />
}

function TimelineMarker({ type, author }: { type: EventType; author: string }) {
    if (type === 'escalation') {
        return (
            <span className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#4a2124] bg-[#2a1517] text-[#E5484D]">
                <TriangleAlert className="h-3 w-3" />
            </span>
        )
    }
    if (type === 'resolve') {
        return (
            <span className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#1d4b3a] bg-[#122a20] text-[#3DD68C]">
                <CircleCheck className="h-3 w-3" />
            </span>
        )
    }
    if (type === 'system') {
        return (
            <span className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#4a3a1a] bg-[#2a2212]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F5A524]" />
            </span>
        )
    }
    return <Avatar name={author} />
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3 py-2.5 text-xs">
            <dt className="text-[#868C9C]">{label}</dt>
            <dd className="text-right font-medium">{children}</dd>
        </div>
    )
}

/* ---------- page ---------- */

export default function IncidentsPage() {
    const { org, isAdmin, canPost } = useDashboardContext()

    const [incidents, setIncidents] = useState<IncidentListItem[]>([])
    const [loaded, setLoaded] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [filter, setFilter] = useState<Filter>('open')
    const [openIncidentModal, setOpenIncidentModal] = useState(false)
    const [version, setVersion] = useState(0) // bump to refetch the queue and the open incident
    const [busy, setBusy] = useState(false)
    const [members, setMembers] = useState<Member[]>([])
    const [loadedDetail, setLoadedDetail] = useState<(IncidentDetail & { incidentId: string }) | null>(null)
    const timelineEndRef = useRef<HTMLDivElement>(null)
    const detailRef = useRef<HTMLElement>(null)
    const filterRef = useRef<Filter>('open') // lets the refetch effect read the current tab without re-running on every tab change

    const selectedIncident = incidents.find(i => i.id === selectedId)
    const visible = incidents.filter(i => matches(i, filter))
    const openCount = incidents.filter(i => matches(i, 'open')).length
    const resolvedCount = incidents.length - openCount

    // detail belongs to one incident; ignore it while a different one is selected
    const detail = loadedDetail?.incidentId === selectedId ? loadedDetail : null
    const requests = detail?.requests ?? []
    const requestedByMe = detail?.requestedByMe ?? false

    useEffect(() => {
        filterRef.current = filter
    }, [filter])

    // the queue
    useEffect(() => {
        let cancelled = false

        getIncidents(org.slug)
            .then(data => {
                if (cancelled) return
                setIncidents(data)
                setLoaded(true)
                // keep the current selection if it still exists, otherwise open the first incident on the current tab
                const pool = data.filter(i => matches(i, filterRef.current))
                setSelectedId(prev => (prev && data.some(i => i.id === prev) ? prev : pool[0]?.id ?? null))
            })
            .catch(() => {
                if (cancelled) return
                setIncidents([])
                setLoaded(true)
            })

        return () => { cancelled = true }
    }, [org.slug, version])

    // timeline + assignment requests for the open incident
    useEffect(() => {
        if (!selectedId) return
        let cancelled = false

        getIncident(org.slug, selectedId)
            .then(d => { if (!cancelled) setLoadedDetail(d ? { ...d, incidentId: selectedId } : null) })
            .catch(() => { if (!cancelled) setLoadedDetail(null) })

        return () => { cancelled = true }
    }, [org.slug, selectedId, version])

    // people the admin can assign
    useEffect(() => {
        if (!isAdmin) return
        let cancelled = false

        getOrgMembers(org.slug)
            .then(d => { if (!cancelled) setMembers(d) })
            .catch(() => { if (!cancelled) setMembers([]) })

        return () => { cancelled = true }
    }, [org.slug, isAdmin])

    // keep the newest message in view
    useEffect(() => {
        timelineEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, [detail?.timeline.length])

    // on small screens the detail sits below the queue, so bring it into view after a pick
    const selectIncident = (id: string) => {
        setSelectedId(id)
        if (window.matchMedia('(max-width: 1023px)').matches) {
            requestAnimationFrame(() =>
                detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            )
        }
    }


    //archive
    const handleArchive = () => {
        if (!selectedIncident) return
        if (!window.confirm(`Archive ${selectedIncident.code}? It will be hidden from the queue.`)) return
        return run(
            () => archiveIncident({ slug: org.slug, incidentId: selectedIncident.id }),
            'Incident archived.'
        )
    }

    const changeFilter = (f: Filter) => {
        setFilter(f)
        const next = incidents.filter(i => matches(i, f))
        // keep the current selection if it's still in the list, otherwise open the first one
        setSelectedId(prev => (prev && next.some(i => i.id === prev) ? prev : next[0]?.id ?? null))
    }

    // one place for busy state, errors, toasts and refetching
    const run = async (fn: () => Promise<ActionResult>, okMessage: string) => {
        if (busy) return
        setBusy(true)
        try {
            const res = await fn()
            if (!res.success) {
                toast.error(res.error)
                return
            }
            toast.success(okMessage)
            setVersion(v => v + 1)
        } catch {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setBusy(false)
        }
    }

    const handleStatus = (action: 'acknowledge' | 'resolve') => {
        if (!selectedIncident) return
        return run(
            () => updateIncidentStatus({ slug: org.slug, incidentId: selectedIncident.id, action }),
            action === 'resolve' ? 'Incident resolved.' : 'Incident acknowledged.'
        )
    }

    const handleAssign = (userId: string) => {
        if (!selectedIncident) return
        return run(
            () => assignIncident({ slug: org.slug, incidentId: selectedIncident.id, userId: userId || null }),
            userId ? 'Incident assigned.' : 'Incident unassigned.'
        )
    }

    const handleRequest = () => {
        if (!selectedIncident) return
        return run(
            () => requestIncident({ slug: org.slug, incidentId: selectedIncident.id }),
            'Request sent.'
        )
    }

    return (
        <div
            className={`flex min-h-[32rem] flex-col overflow-hidden rounded-xl border border-[#262B36] bg-[#15181F] text-[#E7E9EE] lg:flex-row ${PAGE_HEIGHT}`}
        >
            {/* ===== incident queue ===== */}
            <aside className="flex max-h-72 w-full shrink-0 flex-col border-b border-[#262B36] lg:max-h-none lg:w-72 lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between gap-2 border-b border-[#262B36] px-4 py-3">
                    <h2 className="text-[11px] font-semibold tracking-wider text-[#868C9C]">INCIDENT QUEUE</h2>

                    {canPost && (
                        <button
                            type="button"
                            onClick={() => setOpenIncidentModal(v => !v)}
                            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${focusRing} ${openIncidentModal
                                ? 'border-[#262B36] bg-[#1B1F28] hover:border-[#3a4152]'
                                : 'border-[#33477A] bg-[#243352] hover:border-[#4A63A0]'
                                }`}
                        >
                            {!openIncidentModal && <PlusIcon className="h-3.5 w-3.5" />}
                            {openIncidentModal ? 'Cancel' : 'New'}
                        </button>
                    )}
                </div>

                {/* filter tabs */}
                <div role="tablist" aria-label="Filter incidents" className="flex gap-1 border-b border-[#262B36] px-3 py-2">
                    {([
                        ['open', 'Open', openCount],
                        ['resolved', 'Resolved', resolvedCount],
                        ['all', 'All', incidents.length],
                    ] as const).map(([value, label, count]) => (
                        <button
                            key={value}
                            type="button"
                            role="tab"
                            aria-selected={filter === value}
                            onClick={() => changeFilter(value)}
                            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors ${focusRing} ${filter === value ? 'bg-[#1B1F28] text-white' : 'text-[#868C9C] hover:text-white'
                                }`}
                        >
                            {label}
                            <span className="text-[10px] text-[#565C6B]">{count}</span>
                        </button>
                    ))}
                </div>

                {openIncidentModal && (
                    <NewIncidentForm
                        onCreated={id => {
                            setVersion(v => v + 1)
                            setSelectedId(id)
                            setFilter('open') // a new incident is open, so make sure it isn't hidden by the current tab
                            setOpenIncidentModal(false)
                        }}
                    />
                )}

                <ul className="flex-1 overflow-y-auto">
                    {!loaded &&
                        [0, 1, 2, 3].map(i => (
                            <li key={i} className="flex gap-3 border-b border-[#262B36] px-4 py-3">
                                <Skeleton className="mt-1.5 h-2 w-2 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3.5 w-11/12" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </li>
                        ))}

                    {loaded && visible.length === 0 && (
                        <li className="px-4 py-10 text-center">
                            <p className="text-[13px] font-medium">
                                {incidents.length === 0
                                    ? 'No incidents yet'
                                    : filter === 'resolved'
                                        ? 'Nothing resolved yet'
                                        : 'No open incidents'}
                            </p>
                            <p className="mt-1 text-xs text-[#868C9C]">
                                {incidents.length === 0
                                    ? canPost
                                        ? 'Open one when something breaks.'
                                        : 'Nothing has been reported.'
                                    : 'Switch tabs to see other incidents.'}
                            </p>
                        </li>
                    )}

                    {visible.map(inc => {
                        const active = inc.id === selectedId

                        return (
                            <li key={inc.id}>
                                <button
                                    type="button"
                                    onClick={() => selectIncident(inc.id)}
                                    aria-current={active ? 'true' : undefined}
                                    className={`relative flex w-full gap-3 border-b border-[#262B36] px-4 py-3 text-left transition-colors hover:bg-[#1B1F28]/70 ${focusRing} ${active ? 'bg-[#1B1F28]' : ''
                                        }`}
                                >
                                    {active && <span className={`absolute inset-y-0 left-0 w-0.5 ${SEV_BAR[inc.severity]}`} />}
                                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SEV_BAR[inc.severity]}`} />

                                    <span className="min-w-0 flex-1">
                                        <span className="line-clamp-2 text-[13px] font-medium leading-snug">{inc.title}</span>
                                        <span className="mt-1.5 flex items-center gap-2 text-[11px] text-[#868C9C]">
                                            <span className="font-mono">{inc.code}</span>
                                            <StatusPill status={inc.status} />
                                            <span className="ml-auto truncate">{inc.assignee ?? 'Unassigned'}</span>
                                        </span>
                                    </span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </aside>

            {/* ===== header + timeline ===== */}
            <section ref={detailRef} className="flex min-w-0 flex-1 scroll-mt-3 flex-col">
                {!selectedIncident ? (
                    !loaded ? (
                        <div className="space-y-3 p-6">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B1F28] text-[#3DD68C]">
                                <CircleCheck className="h-5 w-5" />
                            </span>
                            <p className="text-sm font-medium">
                                {visible.length === 0
                                    ? filter === 'open'
                                        ? 'All clear'
                                        : 'Nothing here yet'
                                    : 'Select an incident'}
                            </p>
                            <p className="max-w-xs text-xs text-[#868C9C]">
                                {visible.length === 0
                                    ? incidents.length === 0
                                        ? 'There are no incidents in this workspace right now.'
                                        : 'Nothing in this view. Try another tab.'
                                    : 'Pick one from the queue to see its timeline.'}
                            </p>
                        </div>
                    )
                ) : (
                    <>
                        <header className="flex flex-col gap-4 border-b border-[#262B36] p-4 sm:flex-row sm:items-start sm:justify-between lg:p-5">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono text-xs text-[#868C9C]">{selectedIncident.code}</span>
                                    <SeverityBadge severity={selectedIncident.severity} />
                                    <StatusPill status={selectedIncident.status} />
                                </div>
                                <h1 className="mt-2 text-base font-semibold leading-snug lg:text-lg">
                                    {selectedIncident.title}
                                </h1>
                                <p className="mt-1 text-xs text-[#868C9C]">Opened {formatTime(selectedIncident.opened)}</p>
                            </div>

                            <div className="flex shrink-0 flex-wrap gap-2">
                                {selectedIncident.status !== 'Resolved' ? (
                                    canPost && (
                                        <>
                                            {!selectedIncident.acked && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatus('acknowledge')}
                                                    disabled={busy}
                                                    className={btnSecondary}
                                                >
                                                    Acknowledge
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleStatus('resolve')}
                                                disabled={busy}
                                                className={btnDanger}
                                            >
                                                Resolve
                                            </button>
                                        </>
                                    )
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => console.log('generate postmortem')}
                                        className={btnNeutral}
                                    >
                                        Generate postmortem
                                    </button>
                                )}

                                {isAdmin && selectedIncident.status === 'Resolved' && (
                                    <button type="button" onClick={handleArchive} disabled={busy} className={btnNeutral}>
                                        Archive
                                    </button>
                                )}
                            </div>
                        </header>

                        {/* timeline */}
                        <div className="max-h-[60vh] flex-1 overflow-y-auto px-4 py-5 lg:max-h-none lg:px-6">
                            {!detail ? (
                                <div className="space-y-5">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="flex gap-3">
                                            <Skeleton className="h-6 w-6 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-3 w-32" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : detail.timeline.length === 0 ? (
                                <p className="py-8 text-center text-xs text-[#868C9C]">No activity yet.</p>
                            ) : (
                                <ol>
                                    {detail.timeline.map((ev, i) => (
                                        <li key={ev.id} className="relative flex gap-3 pb-5 last:pb-0">
                                            {i < detail.timeline.length - 1 && (
                                                <span className="absolute bottom-0 left-3 top-7 w-px bg-[#262B36]" />
                                            )}
                                            <TimelineMarker type={ev.type} author={ev.author} />

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-baseline gap-x-2">
                                                    <span className="text-xs font-medium">{ev.author}</span>
                                                    <span className="font-mono text-[11px] text-[#565C6B]">{clock(ev.time)}</span>
                                                </div>
                                                <div className={`mt-1 ${EVENT_BOX[ev.type]}`}>
                                                    <p className={`wrap-break-word text-[13px] leading-relaxed ${EVENT_TEXT[ev.type]}`}>
                                                        {ev.text}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            )}
                            <div ref={timelineEndRef} />
                        </div>
                    </>
                )}
            </section>

            {/* ===== side panel ===== */}
            {selectedIncident && (
                <aside className="w-full shrink-0 overflow-y-auto border-t border-[#262B36] lg:w-72 lg:border-l lg:border-t-0">
                    {selectedIncident.escalatesAt && selectedIncident.status !== 'Resolved' && (
                        <div className="border-b border-[#262B36] p-4 pb-0">
                            <EscalationCountdown
                                escalatesAt={selectedIncident.escalatesAt}
                                onExpired={() => setVersion(v => v + 1)}
                            />
                        </div>
                    )}

                    {/* assignee */}
                    <div className="border-b border-[#262B36] p-4">
                        <SectionLabel>ASSIGNED TO</SectionLabel>

                        {isAdmin ? (
                            <select
                                value={selectedIncident.assigneeId ?? ''}
                                onChange={e => handleAssign(e.target.value)}
                                disabled={busy || selectedIncident.status === 'Resolved'}
                                className={selectClass}
                            >
                                <option value="">Unassigned</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        ) : selectedIncident.assignee ? (
                            <div className="flex items-center gap-2">
                                <Avatar name={selectedIncident.assignee} />
                                <span className="text-[13px]">{selectedIncident.assignee}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-start gap-2.5">
                                <p className="text-[13px] text-[#868C9C]">Nobody yet</p>

                                {selectedIncident.status !== 'Resolved' && canPost &&
                                    (requestedByMe ? (
                                        <p className="text-[11px] text-[#565C6B]">Request sent, waiting on an admin.</p>
                                    ) : (
                                        <button type="button" onClick={handleRequest} disabled={busy} className={smallBtn}>
                                            Request to work on this
                                        </button>
                                    ))}
                            </div>
                        )}

                        {/* admins: who has asked to take it */}
                        {isAdmin && requests.length > 0 && (
                            <ul className="mt-3 flex flex-col gap-2 rounded-md border border-[#262B36] bg-[#1B1F28]/50 p-2">
                                {requests.map(r => (
                                    <li key={r.id} className="flex items-center justify-between gap-2 text-xs">
                                        <span className="flex min-w-0 items-center gap-2">
                                            <Avatar name={r.name} size="sm" />
                                            <span className="truncate">{r.name}</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleAssign(r.id)}
                                            disabled={busy}
                                            className={`${smallBtn} shrink-0 px-2 py-1`}
                                        >
                                            Approve
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* details */}
                    <div className="p-4">
                        <SectionLabel>DETAILS</SectionLabel>
                        <dl className="divide-y divide-[#262B36]">
                            <DetailRow label="Opened">
                                <span className="text-[#E7E9EE]">{formatTime(selectedIncident.opened)}</span>
                            </DetailRow>
                            <DetailRow label="Acknowledged">
                                <span className={selectedIncident.acked ? 'text-[#3DD68C]' : 'text-[#868C9C]'}>
                                    {selectedIncident.acked ? 'Yes' : 'Pending'}
                                </span>
                            </DetailRow>
                            <DetailRow label="Escalated">
                                <span className={selectedIncident.escalated ? 'text-[#E5484D]' : 'text-[#868C9C]'}>
                                    {selectedIncident.escalated ? 'Yes, Tier 2 paged' : 'No'}
                                </span>
                            </DetailRow>
                        </dl>
                    </div>
                </aside>
            )}
        </div>
    )
}