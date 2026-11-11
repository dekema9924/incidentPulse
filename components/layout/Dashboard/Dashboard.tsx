
'use client'

import { useDashboardContext } from '@/context/DashboardContext'
import StatCard from '@/components/ui/StatCard'
import NeedsAttention, { type AttentionItem } from './NeedsAttention'
import { useEffect, useState } from 'react'
import { getIncidents } from '@/src/lib/dashboard/incident-actions'

// TODO: delete this mock once the real fetch below is wired in
const now = Date.now()
const MOCK: AttentionItem[] = [
    { id: '1', code: 'INC-1839', title: 'logs not prinying', severity: 'P1', status: 'Investigating', assignee: null, opened: now - 90 * 60000, escalated: false },
    { id: '2', code: 'INC-3490', title: 'logs not prinying', severity: 'P1', status: 'Investigating', assignee: null, opened: now - 60 * 60000, escalated: true },
    { id: '3', code: 'INC-1043', title: 'test', severity: 'P2', status: 'Investigating', assignee: null, opened: now - 30 * 60000, escalated: false },
    { id: '4', code: 'INC-2041', title: 'Payment gateway returning 502s for EU region', severity: 'P1', status: 'Investigating', assignee: null, opened: now - 10 * 60000, escalated: false },
    { id: '5', code: 'INC-2038', title: 'Nightly batch reconciliation job failed', severity: 'P3', status: 'Resolved', assignee: 'Elena K.', opened: now - 3 * 3600000, escalated: false },
]

export default function Dashboard() {
    const { org, setIsActiveId } = useDashboardContext()

    // TODO: replace the mock with real data (getIncidents already exists):
    const [incidents, setIncidents] = useState<AttentionItem[] | null>(null) // null = loading
    useEffect(() => {
        let cancelled = false
        getIncidents(org.slug)
            .then(d => { if (!cancelled) setIncidents(d) })
            .catch(() => { if (!cancelled) setIncidents([]) })
        return () => { cancelled = true }
    }, [org.slug])

    const open = incidents?.filter(i => i.status !== 'Resolved') ?? []
    const stats = {
        total: incidents ? incidents.length : null,
        open: incidents ? open.length : null,
        escalated: incidents ? open.filter(i => i.escalated).length : null, // escalated and still open
        resolved: incidents ? incidents.length - open.length : null,
    }

    // TODO: open the clicked incident directly. That needs a shared `focusIncidentId` in DashboardContext
    // that IncidentsPage reads when it loads. For now this just switches to the Incidents tab.
    const goToIncidents = () => setIsActiveId(2) // 2 = Incidents in your sidebar array

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Total incidents" value={stats.total} hint="in this workspace" />
                <StatCard label="Open" value={stats.open} hint="not resolved yet" />
                <StatCard
                    label="Escalated"
                    value={stats.escalated}
                    hint="open and paged"
                    tone={stats.escalated ? 'danger' : 'default'}
                />
                <StatCard label="Resolved" value={stats.resolved} hint="closed" tone="success" />
            </div>

            <NeedsAttention
                orgName={org.name}
                incidents={incidents}
                onSelect={goToIncidents}
                onViewAll={goToIncidents}
            />

            {/* TODO: more panels as you build them, e.g. recent activity or incidents per week */}
        </div>
    )
}