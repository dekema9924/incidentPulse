'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useDashboardContext } from '@/context/DashboardContext'
import { useOrgModalContext } from '@/context/DashboardModals'
// "Northwind Studio" → "NS", "test organization" → "TO"
const initials = (name: string) => {
    const words = name.trim().split(/\s+/)
    return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0]).toUpperCase()
}

export default function OrgSwitcher() {
    const { org, orgs } = useDashboardContext()
    const { setNewOrgOpen } = useOrgModalContext()

    return (
        <div className="absolute top-12 w-full overflow-hidden rounded-lg border border-[#262B36] bg-[#1B1F28] text-[13px] text-[#E7E9EE] shadow-lg">
            {/* org list */}
            <div className="p-1">
                {orgs.map(o => {
                    const isActive = o.slug === org.slug

                    return (
                        <Link
                            key={o.id}
                            href={`/dashboard/${o.slug}`}
                            className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors hover:bg-[#15181F] ${isActive ? 'bg-[#15181F]' : ''
                                }`}
                        >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#243352] text-[10px] font-bold text-[#A9C0FF]">
                                {initials(o.name)}
                            </span>
                            <span className="truncate">{o.name}</span>
                            {isActive && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#5B8DEF]" />}
                        </Link>
                    )
                })}
            </div>

            {/* new organization */}
            <button
                type="button"
                onClick={() => setNewOrgOpen(true)}
                className="flex w-full items-center gap-2 border-t border-[#262B36] px-3.5 py-2.5 text-left text-[#5B8DEF] transition-colors hover:bg-[#15181F]"
            >
                <Plus className="h-3.5 w-3.5" />
                New organization
            </button>
        </div>
    )
}