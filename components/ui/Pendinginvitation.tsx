'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { inviteMember } from '@/src/lib/dashboard-actions' // wherever your inviteMember lives
import { useOrgModalContext } from '@/context/DashboardModals'
import { getPendingInvites, revokeInvitation } from '@/src/lib/accept-invite'

type PendingInvite = {
    id: string
    email: string
    role: string
    invitedBy: string
    daysLeft: number
}

const roleLabel = (role: string) => role.charAt(0) + role.slice(1).toLowerCase() // "MEMBER" → "Member"

export default function Pendinginvitation() {
    const { slug } = useParams<{ slug: string }>()
    const { invitesVersion } = useOrgModalContext()


    const [invites, setInvites] = useState<PendingInvite[] | null>(null)
    const [busyId, setBusyId] = useState<string | null>(null)

    useEffect(() => {

        let cancelled = false

        getPendingInvites(slug)
            .then(data => { if (!cancelled) setInvites(data) })
            .catch(() => { if (!cancelled) setInvites([]) })

        return () => { cancelled = true }
    }, [slug, invitesVersion]) // refetches when a new invite is sent

    const handleRevoke = async (id: string) => {
        setBusyId(id)
        try {
            const res = await revokeInvitation(slug, id)
            if (!res.success) {
                toast.error(res.error)
                return
            }
            setInvites(prev => prev?.filter(i => i.id !== id) ?? null)
            toast.success('Invitation revoked.')
        } catch {
            toast.error('Something went wrong.')
        } finally {
            setBusyId(null)
        }
    }

    const handleResend = async (invite: PendingInvite) => {
        setBusyId(invite.id)
        try {
            // inviteMember revokes the old link and sends a fresh one
            const res = await inviteMember({
                slug,
                email: invite.email,
                role: invite.role as 'ADMIN' | 'MEMBER' | 'VIEWER',
            })
            if (!res.success) {
                toast.error(res.error)
                return
            }
            toast.success('Invitation sent again.')
            const fresh = await getPendingInvites(slug)
            setInvites(fresh)
        } catch {
            toast.error('Something went wrong.')
        } finally {
            setBusyId(null)
        }
    }

    // nothing to show: no empty card
    if (!invites || invites.length === 0) return null

    return (
        <div className="panel my-5 rounded-md p-3 text-xs">
            <span className="secondary-text">PENDING INVITATIONS ({invites.length})</span>

            {invites.map(invite => (
                <div key={invite.id} className="flex items-center justify-between gap-3 my-2">
                    <div className="min-w-0">
                        <p className="truncate">{invite.email}</p>
                        <span className="secondary-text">
                            invited by {invite.invitedBy} · role {roleLabel(invite.role)} · expires in {invite.daysLeft} {invite.daysLeft === 1 ? 'day' : 'days'}
                        </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <button
                            onClick={() => handleResend(invite)}
                            disabled={busyId === invite.id}
                            className="panel h-8 w-fit cursor-pointer rounded-md border px-2 text-xs font-semibold hover:bg-[#646a7a] disabled:opacity-50"
                        >
                            Resend
                        </button>
                        <button
                            onClick={() => handleRevoke(invite.id)}
                            disabled={busyId === invite.id}
                            className="panel h-8 w-fit cursor-pointer rounded-md px-2 text-xs font-semibold hover:bg-[#646a7a] disabled:opacity-50"
                        >
                            Revoke
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}