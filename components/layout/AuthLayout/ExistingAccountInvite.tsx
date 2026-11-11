// components/layout/AuthLayout/ExistingAccountInvite.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import { respondToInvitation } from '@/src/lib/dashboard/accept-invite'

const roleLabel = (role: string) => role.charAt(0) + role.slice(1).toLowerCase()

export default function ExistingAccountInvite({
    invitationId,
    orgName,
    role,
}: {
    invitationId: string
    orgName: string
    role: string
}) {
    const router = useRouter()
    const [busy, setBusy] = useState(false)

    const respond = async (decision: 'accept' | 'decline') => {
        setBusy(true)
        try {
            const res = await respondToInvitation({ invitationId, decision })

            if (!res.success) {
                toast.error(res.error)
                return
            }

            if (decision === 'accept' && res.slug) {
                toast.success(`Welcome to ${orgName}!`)
                router.replace(`/dashboard/${res.slug}`)
            } else {
                toast.success('Invitation declined.')
                router.replace('/dashboard') // your guards route them from here
            }
        } catch {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0e0f14] px-4 py-6">
            <div className="panel rounded-lg w-[min(360px,92vw)] p-[clamp(20px,5vw,28px)] text-center">
                <Logo />
                <p className="mt-4 text-sm">
                    You&apos;ve been invited to join{' '}
                    <span className="font-semibold text-white">{orgName}</span> as{' '}
                    <span className="font-semibold text-white">{roleLabel(role)}</span>
                </p>

                <div className="mt-5 flex gap-2">
                    <button
                        onClick={() => respond('decline')}
                        disabled={busy}
                        className="panel h-8 flex-1 cursor-pointer rounded-md border text-xs font-semibold hover:bg-[#646a7a] disabled:opacity-50"
                    >
                        Decline
                    </button>
                    <button
                        onClick={() => respond('accept')}
                        disabled={busy}
                        className="h-8 flex-1 cursor-pointer rounded-md border border-[#32519b] bg-[#243352] text-xs font-semibold text-white hover:border-[#4A63A0] disabled:opacity-50"
                    >
                        {busy ? 'Working…' : 'Accept'}
                    </button>
                </div>
            </div>
        </div>
    )
}