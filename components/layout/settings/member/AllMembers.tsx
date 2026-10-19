
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getMembers } from '../../../../src/lib/org-access'
export type Role = 'Owner' | 'Admin' | 'Member' | 'Viewer'


type memberType = {
    name: string
    email: string
    role: Role
    joinedDate: string
}

// full class names so Tailwind can see them (no string-built classes)
const ROLE_PILL: Record<Role, string> = {
    Owner: 'bg-[#243352] border-[#33477A] text-[#A9C0FF]',
    Admin: 'border-[#3a4152] text-[#E7E9EE]',
    Member: 'border-[#262B36] text-[#868C9C]',
    Viewer: 'border-[#262B36] text-[#565C6B]',
}

// "You" → "YO", "Marcus T." → "MT"
const initials = (name: string) => {
    const words = name.trim().split(/\s+/)
    return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0]).toUpperCase()
}

const ROW_GRID = 'grid grid-cols-[1fr_96px] sm:grid-cols-[1fr_120px_120px] items-center gap-3 px-4'

export default function AllMembers() {
    const { slug } = useParams<{ slug: string }>() // matches the [slug] folder name
    const [members, setMembers] = useState<memberType[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        getMembers(slug)
            .then(data => { if (!cancelled) setMembers(data) })
            .catch(() => { if (!cancelled) setError('Could not load members.') })

        return () => { cancelled = true } // ignore a slow response if the slug changed
    }, [slug])

    if (error) return <p className="mt-5 text-xs text-[#E5484D]">{error}</p>
    if (!members) return <p className="mt-5 text-xs text-[#868C9C]">Loading members…</p>


    return (
        <div className="mt-5 max-w-3xl text-[#E7E9EE]">
            {/* ===== TABLE ===== */}
            <div className="overflow-hidden rounded-xl border border-[#262B36] bg-[#15181F]">
                {/* header */}
                <div className={`${ROW_GRID} py-3 text-[11px] uppercase tracking-wide text-[#565C6B]`}>
                    <span>Member</span>
                    <span>Role</span>
                    <span className="hidden sm:block">Joined</span>
                </div>

                {/* rows */}
                {members.map(member => (
                    <div key={member.email} className={`${ROW_GRID} py-3 border-t border-[#262B36]`}>
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#243352] text-[10px] font-semibold text-[#A9C0FF]">
                                {initials(member.name)}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-[13px] font-semibold">{member.name}</p>
                                <p className="truncate text-[11px] text-[#868C9C]">{member.email}</p>
                            </div>
                        </div>

                        <span>
                            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] ${ROLE_PILL[member.role]}`}>
                                {member.role}
                            </span>
                        </span>

                        <span className="hidden text-[13px] font-semibold sm:block">
                            {member.joinedDate}
                        </span>
                    </div>
                ))}
            </div>

            {/* ===== ROLE LEGEND ===== */}
            <div className="mt-4 flex flex-col gap-1.5 text-xs text-[#868C9C]">
                <p><b className="text-[#E7E9EE]">Admin</b> — manages members, incidents, and settings</p>
                <p><b className="text-[#E7E9EE]">Member</b> — creates and works on incidents</p>
                <p><b className="text-[#E7E9EE]">Viewer</b> — read-only access to everything they can see</p>
            </div>
        </div>
    )
}