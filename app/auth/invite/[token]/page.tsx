// your invite route's page.tsx
import { redirect } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import { prisma } from '@/src/lib/prisma'
import { getSession } from '@/src/lib/auth/auth-utils'   // the cached session helper; add `export` to it if it isn't exported yet
import { getValidInvitation } from '@/utils/Invitation'
import InviteForm from '@/components/layout/AuthLayout/InviteForm'
import ExistingAccountInvite from '@/components/layout/AuthLayout/ExistingAccountInvite'
import SwitchAccountButton from '@/components/layout/AuthLayout/SwitchAccountButton'

// the centered card used by every message state (not exported, so Next.js is fine with it in a page file)
function Message({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0e0f14] px-4 py-6">
            <div className="panel rounded-lg w-[min(360px,92vw)] p-6 text-center">
                <Logo />
                {children}
            </div>
        </div>
    )
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const invite = await getValidInvitation(token)

    // 1. bad, expired, used or revoked link
    if (!invite) {
        return (
            <Message>
                <p className="mt-4 text-sm">This invitation is invalid or has expired.</p>
                <p className="secondary-text mt-2 text-xs">Ask an admin to send you a new one.</p>
            </Message>
        )
    }

    const session = await getSession()

    // 2. signed in as a different person than the one invited
    if (session && session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
        return (
            <Message>
                <p className="mt-4 text-sm">
                    You&apos;re signed in as <span className="font-semibold text-white">{session.user.email}</span>.
                </p>
                <p className="secondary-text mt-2 text-xs">
                    This invitation was sent to {invite.email}. Sign out to continue.
                </p>
                <SwitchAccountButton />
            </Message>
        )
    }

    // 3. the invited address already has an account: no signup form
    const existing = await prisma.user.findFirst({
        where: { email: { equals: invite.email, mode: 'insensitive' } },
        select: { id: true },
    })

    if (existing) {
        if (!session) {
            // sign in first, then come back to this same link
            redirect(`/auth/sign-in?callbackUrl=${encodeURIComponent(`/auth/invite/${token}`)}`)
        }
        return (
            <ExistingAccountInvite
                invitationId={invite.id}
                orgName={invite.organization.name}
                role={invite.role}
            />
        )
    }

    // 4. brand-new person: the signup form
    return (
        <InviteForm
            token={token}
            email={invite.email}
            orgName={invite.organization.name}
            role={invite.role}
        />
    )
}