'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useDashboardContext } from '@/context/DashboardContext'
import { inviteMember } from '@/src/lib/dashboard-actions'
import toast from 'react-hot-toast'
import { useOrgModalContext } from '@/context/DashboardModals'

type InviteRole = 'ADMIN' | 'MEMBER' | 'VIEWER' // no OWNER: ownership is never given by invitation

const labelClass = 'mb-1.5 block text-[11px] text-[#565C6B]'
const inputClass =
    'mb-4 w-full rounded-md border border-[#262B36] bg-[#1B1F28] px-3 py-2.5 text-[13px] text-[#E7E9EE] outline-none placeholder:text-[#565C6B] focus:border-[#5B8DEF]'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function InviteMemberModal({ onClose }: { onClose: () => void }) {
    const router = useRouter()
    const { org } = useDashboardContext()

    const [email, setEmail] = useState('')
    const [role, setRole] = useState<InviteRole>('MEMBER')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { refreshInvites } = useOrgModalContext()

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) onClose()
        }
        document.addEventListener('keydown', onKey)

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = previousOverflow
        }
    }, [onClose, loading])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const cleanEmail = email.trim().toLowerCase()
        if (!EMAIL_PATTERN.test(cleanEmail)) {
            setError('Please enter a valid email address.')
            return
        }

        setError(null)
        setLoading(true)
        try {
            // nvite server action 
            const result = await inviteMember({ slug: org.slug, email: cleanEmail, role })
            // console.log("result", result)
            if (!result.success) {
                setError(result.error); toast.error(result.error)
                return
            }
            toast.success("email sent successfully")




            onClose()
            refreshInvites() // re-fetch so the new pending invitation appears in the list
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={e => {
                if (e.target === e.currentTarget && !loading) onClose()
            }}
        >
            <form
                onSubmit={handleSubmit}
                role="dialog"
                aria-modal="true"
                aria-labelledby="invite-title"
                className="w-full max-w-md rounded-xl border border-[#262B36] bg-[#15181F] p-6 text-[#E7E9EE] shadow-2xl"
            >
                <h2 id="invite-title" className="text-base font-semibold">
                    Invite a member
                </h2>
                <p className="mt-1 mb-5 text-xs leading-relaxed text-[#868C9C]">
                    They&apos;ll get an email with a link that expires in seven days.
                </p>

                <label htmlFor="invite-email" className={labelClass}>
                    Email
                </label>
                <input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    autoComplete="off"
                    autoFocus
                    className={inputClass}
                />

                <label htmlFor="invite-role" className={labelClass}>
                    Role
                </label>
                <select
                    id="invite-role"
                    value={role}
                    onChange={e => setRole(e.target.value as InviteRole)}
                    className={inputClass}
                >
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                    <option value="VIEWER">Viewer</option>
                </select>

                {error && <p className="-mt-1 mb-3 text-xs text-[#E5484D]">{error}</p>}

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-md border border-[#262B36] bg-[#1B1F28] px-4 py-2 text-[13px] hover:border-[#3a4152] disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md border border-[#33477A] bg-[#243352] px-4 py-2 text-[13px] font-medium hover:border-[#4A63A0] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Sending…' : 'Send invitation'}
                    </button>
                </div>
            </form>
        </div>,
        document.body
    )
}