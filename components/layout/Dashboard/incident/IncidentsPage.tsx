'use client'

import { useEffect, useRef, useState } from 'react'
import { PlusIcon, TriangleAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
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
} from '@/src/lib/incident-actions'
import { formatTime } from '@/utils/constants'

type EventType = 'msg' | 'system' | 'escalation' | 'resolve'
type Member = { id: string; name: string }
type ActionResult = { success: true } | { success: false; error: string }
type IncidentDetail = NonNullable<Awaited<ReturnType<typeof getIncident>>>

const SEV_BAR: Record<IncidentListItem['severity'], string> = {
    P1: 'bg-[#E5484D]',
    P2: 'bg-[#F5A524]',
    P3: 'bg-[#5B8DEF]',
}

const STATUS_PILL: Record<IncidentListItem['status'], string> = {
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

const selectClass =
    'w-full rounded-md border border-[#262B36] bg-[#1B1F28] px-2.5 py-2 text-[13px] text-[#E7E9EE] outline-none focus:border-[#5B8DEF] disabled:cursor-not-allowed disabled:opacity-50 [color-scheme:dark]'

const smallBtn =
    'rounded-md border border-[#262B36] bg-[#1B1F28] px-3 py-1.5 text-xs hover:border-[#3a4152] disabled:cursor-not-allowed disabled:opacity-50'

const clock = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export default function IncidentsPage() {
    const { org, isAdmin, canPost } = useDashboardContext()

    const [incidents, setIncidents] = useState<IncidentListItem[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [openIncidentModal, setOpenIncidentModal] = useState(false)
    const [version, setVersion] = useState(0) // bump to refetch the queue and the open incident
    const [busy, setBusy] = useState(false)
    const [members, setMembers] = useState<Member[]>([])
    const [loadedDetail, setLoadedDetail] = useState<(IncidentDetail & { incidentId: string }) | null>(null)
    const timelineEndRef = useRef<HTMLDivElement>(null)

    const selectedIncident = incidents.find(i => i.id === selectedId)

    // detail belongs to one incident; ignore it while a different one is selected
    const detail = loadedDetail?.incidentId === selectedId ? loadedDetail : null
    const requests = detail?.requests ?? []
    const requestedByMe = detail?.requestedByMe ?? false

    // the queue
    useEffect(() => {
        let cancelled = false

        getIncidents(org.slug)
            .then(data => {
                if (cancelled) return
                setIncidents(data)
                // keep the current selection if it still exists, otherwise open the first incident
                setSelectedId(prev => (prev && data.some(i => i.id === prev) ? prev : data[0]?.id ?? null))
            })
            .catch(() => { if (!cancelled) setIncidents([]) })

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
        <main className="flex min-h-screen flex-col text-[#E7E9EE] lg:flex-row">
            {/* ===== incident queue ===== */}
            <section className="max-h-56 shrink-0 overflow-y-auto border-b border-[#262B36] lg:max-h-none lg:w-64 lg:border-b-0 lg:border-r">
                <div className="my-2 flex items-center gap-4 px-4">
                    <span className="secondary-text text-xs">INCIDENT QUEUE</span>
                    {canPost && (
                        <button
                            type="button"
                            onClick={() => setOpenIncidentModal(v => !v)}
                            className="panel flex h-6! w-fit! cursor-pointer items-center gap-1 rounded-md px-3 text-xs"
                        >
                            {!openIncidentModal && <PlusIcon className="w-4" />}
                            {openIncidentModal ? 'Cancel' : 'New'}
                        </button>
                    )}
                </div>

                {openIncidentModal && (
                    <NewIncidentForm
                        onCreated={id => {
                            setVersion(v => v + 1)
                            setSelectedId(id)
                            setOpenIncidentModal(false)
                        }}
                    />
                )}

                {incidents.map(inc => (
                    <button
                        key={inc.id}
                        onClick={() => setSelectedId(inc.id)}
                        className={`flex w-full gap-3 border-b border-[#262B36] px-4 py-3 text-left hover:bg-[#15181F] ${inc.id === selectedId ? 'bg-[#1B1F28]' : ''
                            }`}
                    >
                        <span className={`w-0.75 shrink-0 rounded-sm ${SEV_BAR[inc.severity]}`} />
                        <span className="min-w-0">
                            <span className="mb-1.5 block text-[13px] leading-snug">{inc.title}</span>
                            <span className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#868C9C]">
                                <span>{inc.code}</span>
                                <span className={`rounded-[3px] border px-1.5 py-px text-[10px] ${STATUS_PILL[inc.status]}`}>
                                    {inc.status}
                                </span>
                                <span>{inc.assignee ?? 'Unassigned'}</span>
                            </span>
                        </span>
                    </button>
                ))}
            </section>

            {/* ===== header + chat ===== */}
            {!selectedIncident ? (
                <section className="flex min-h-64 flex-1 items-center justify-center px-6 text-center text-xs text-[#565C6B]">
                    Select an incident, or open a new one.
                </section>
            ) : (
                <>
                    <section className="flex min-h-80 min-w-0 flex-1 flex-col">
                        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between lg:p-6">
                            <div className="flex min-w-0 flex-col gap-2">
                                <h1 className="font-semibold">{selectedIncident.title}</h1>
                                <div className="secondary-text flex flex-wrap items-center gap-2 text-xs">
                                    <span className="font-mono">{selectedIncident.code}</span>
                                    <span className={`rounded-[3px] border px-1.5 py-px text-[10px] ${STATUS_PILL[selectedIncident.status]}`}>
                                        {selectedIncident.status}
                                    </span>
                                    <span>severity {selectedIncident.severity}</span>
                                </div>
                                <span className="secondary-text text-xs">Opened {formatTime(selectedIncident.opened)}</span>
                            </div>

                            <div className="flex shrink-0 gap-2">
                                {selectedIncident.status !== 'Resolved' ? (
                                    canPost && (
                                        <>
                                            {!selectedIncident.acked && (
                                                <Button
                                                    onClick={() => handleStatus('acknowledge')}
                                                    text="Acknowledge"
                                                    className="h-7 w-fit border border-[#33477a] bg-[#243352]! px-4 text-xs text-white"
                                                />
                                            )}
                                            <Button
                                                onClick={() => handleStatus('resolve')}
                                                text="Resolve"
                                                className="h-7 w-fit border border-[#e5484d]/10 bg-[#e5484d]/20! px-4 text-xs text-white"
                                            />
                                        </>
                                    )
                                ) : (
                                    <Button
                                        onClick={() => console.log('generate postmortem')}
                                        text="Generate Postmortem"
                                        className="h-7 w-fit border border-[#e5484d]/10 px-4 text-xs text-white"
                                    />
                                )}
                            </div>
                        </div>

                        <hr className="panel border-t-0!" />

                        {/* chat */}
                        <div className="max-h-[65vh] flex-1 overflow-y-auto px-5 py-4">
                            {(detail?.timeline ?? []).map(ev => (
                                <div key={ev.id} className="mb-5 flex gap-3">
                                    <span className="w-16 shrink-0 pt-0.5 font-mono text-[11px] text-[#565C6B]">
                                        {clock(ev.time)}
                                    </span>
                                    <div className="min-w-0 text-[13px] leading-relaxed">
                                        <p className="mb-0.5 text-[11px] text-[#868C9C]">{ev.author}</p>
                                        <p className={`flex items-start gap-1.5 break-words ${EVENT_TEXT[ev.type]}`}>
                                            {ev.type === 'escalation' && <TriangleAlert className="mt-1 h-3 w-3 shrink-0" />}
                                            <span>{ev.text}</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={timelineEndRef} />
                        </div>
                    </section>

                    {/* ===== assign incident ===== */}
                    <section className="w-full shrink-0 overflow-y-auto border-t border-[#262B36] p-4 text-xs lg:w-64 lg:border-l lg:border-t-0">
                        <div className="mb-5">
                            <span className="secondary-text mb-1.5 block text-[11px]">Assigned to</span>

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
                                <p className="text-[13px]">{selectedIncident.assignee}</p>
                            ) : (
                                <div className="flex flex-col items-start gap-2">
                                    <p className="text-[13px]">Unassigned</p>

                                    {selectedIncident.status !== 'Resolved' && canPost &&
                                        (requestedByMe ? (
                                            <p className="text-[11px] text-[#565C6B]">Request sent, waiting on an admin.</p>
                                        ) : (
                                            <button onClick={handleRequest} disabled={busy} className={smallBtn}>
                                                Request to work on this
                                            </button>
                                        ))}
                                </div>
                            )}

                            {/* admins: who has asked to take it */}
                            {isAdmin && requests.length > 0 && (
                                <ul className="mt-3 flex flex-col gap-2">
                                    {requests.map(r => (
                                        <li key={r.id} className="flex items-center justify-between gap-2">
                                            <span className="min-w-0 truncate">{r.name} requested this</span>
                                            <button
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

                        <dl className="grid grid-cols-1 gap-3 text-[#868C9C] sm:grid-cols-3 lg:grid-cols-1">
                            <div>
                                <dt className="font-medium text-[#E7E9EE]">Opened</dt>
                                <dd>{formatTime(selectedIncident.opened)}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-[#E7E9EE]">Acknowledged</dt>
                                <dd>{selectedIncident.acked ? 'Yes' : 'No, pending'}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-[#E7E9EE]">Escalated</dt>
                                <dd>{selectedIncident.escalated ? 'Yes, Tier 2 paged' : 'No'}</dd>
                            </div>
                        </dl>
                    </section>
                </>
            )}
        </main>
    )
}