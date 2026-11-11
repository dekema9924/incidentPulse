'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { getMyInvitations, respondToInvitation } from '@/src/lib/dashboard/accept-invite'

type MyInvite = { id: string; orgName: string; role: string; invitedBy: string; daysLeft: number }

const roleLabel = (role: string) => role.charAt(0) + role.slice(1).toLowerCase()

export default function Inbox() {
    const router = useRouter()
    const [invites, setInvites] = useState<MyInvite[] | null>(null)
    const [busyId, setBusyId] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        getMyInvitations()
            .then(d => { if (!cancelled) setInvites(d) })
            .catch(() => { if (!cancelled) setInvites([]) })
        return () => { cancelled = true }
    }, [])

    const respond = async (id: string, decision: 'accept' | 'decline') => {
        setBusyId(id)
        try {
            const res = await respondToInvitation({ invitationId: id, decision })
            if (!res.success) {
                toast.error(res.error)
                return
            }

            setInvites(prev => prev?.filter(i => i.id !== id) ?? null)

            if (decision === 'accept' && res.slug) {
                toast.success('You joined the workspace.')
                router.push(`/dashboard/${res.slug}`) // reloads the layout, so the org switcher picks up the new org
            } else {
                toast.success('Invitation declined.')
            }
        } catch {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setBusyId(null)
        }
    }

    if (!invites) return <p className="mt-5 text-xs text-[#868C9C]">Loading…</p>

    if (invites.length === 0) {
        return (
            <div className="panel mt-5 rounded-md p-6 text-center text-xs">
                <p className="font-medium">No pending invitations</p>
                <p className="secondary-text mt-1">When someone invites you to a workspace, it shows up here.</p>
            </div>
        )
    }

    return (
        <ul className="mt-5 flex max-w-3xl flex-col gap-3">
            {invites.map(inv => (
                <li
                    key={inv.id}
                    className="panel flex flex-col gap-3 rounded-md p-4 text-xs sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold">{inv.orgName}</p>
                        <p className="secondary-text mt-0.5">
                            {inv.invitedBy} invited you as {roleLabel(inv.role)} · expires in {inv.daysLeft} {inv.daysLeft === 1 ? 'day' : 'days'}
                        </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        <button
                            onClick={() => respond(inv.id, 'decline')}
                            disabled={busyId === inv.id}
                            className="rounded-md border border-[#262B36] bg-[#1B1F28] px-3 py-1.5 hover:border-[#3a4152] disabled:opacity-50"
                        >
                            Decline
                        </button>
                        <button
                            onClick={() => respond(inv.id, 'accept')}
                            disabled={busyId === inv.id}
                            className="rounded-md border border-[#33477A] bg-[#243352] px-3 py-1.5 font-medium hover:border-[#4A63A0] disabled:opacity-50"
                        >
                            Accept
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    )
}