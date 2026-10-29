'use client'

import { useState } from 'react'
import { useDashboardContext } from '@/context/DashboardContext'
import { createIncident } from '@/src/lib/incident-actions'

type Severity = 'P1' | 'P2' | 'P3'

const SEVERITIES: { value: Severity; label: string }[] = [
    { value: 'P1', label: 'P1 — critical, customer-facing' },
    { value: 'P2', label: 'P2 — degraded, limited impact' },
    { value: 'P3', label: 'P3 — minor, internal only' },
]

const fieldClass =
    'w-full rounded-md border border-[#262B36] bg-[#1B1F28] px-2.5 py-2 text-[13px] text-[#E7E9EE] outline-none placeholder:text-[#565C6B] focus:border-[#5B8DEF] disabled:cursor-not-allowed disabled:opacity-50'

export default function NewIncidentForm({ onCreated }: { onCreated?: (id: string) => void }) {
    const { org, canPost } = useDashboardContext()

    const [title, setTitle] = useState('')
    const [severity, setSeverity] = useState<Severity>('P1')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!canPost) return

        const cleanTitle = title.trim()
        if (!cleanTitle) {
            setError('Describe what is happening.')
            return
        }

        setError(null)
        setLoading(true)
        try {
            const incidentInput = {
                slug: org.slug,
                title: cleanTitle,
                severity
            }
            // create-incident server action 
            const result = await createIncident(incidentInput)
            console.log(result)
            if (!result.success) { setError(result.error); return }

            setTitle('')
            setSeverity('P1')
            onCreated?.(result.id) // lets the parent close the form
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 border-b border-[#262B36] bg-[#15181F] px-4 py-3"
        >
            <label htmlFor="incident-title" className="sr-only">
                What&apos;s happening?
            </label>
            <input
                id="incident-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What's happening?"
                maxLength={120}
                autoComplete="off"
                autoFocus
                disabled={!canPost || loading}
                className={fieldClass}
            />

            <label htmlFor="incident-severity" className="sr-only">
                Severity
            </label>
            <select
                id="incident-severity"
                value={severity}
                onChange={e => setSeverity(e.target.value as Severity)}
                disabled={!canPost || loading}
                className={`${fieldClass} scheme-dark`}
            >
                {SEVERITIES.map(s => (
                    <option key={s.value} value={s.value}>
                        {s.label}
                    </option>
                ))}
            </select>

            {error && <p className="text-xs text-[#E5484D]">{error}</p>}

            <button
                type="submit"
                disabled={!canPost || loading}
                title={!canPost ? 'You have read-only access' : undefined}
                className="w-full rounded-md border border-[#33477A] bg-[#243352] py-2 text-[13px] font-medium text-[#E7E9EE] hover:border-[#4A63A0] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? 'Opening…' : 'Open incident'}
            </button>
        </form>
    )
}