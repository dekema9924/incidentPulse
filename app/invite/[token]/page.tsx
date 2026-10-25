// your invite route's page.tsx
import Logo from '@/components/ui/Logo'
import { getValidInvitation } from '@/utils/Invitation'
import InviteForm from '@/components/layout/AuthLayout/InviteForm'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const invite = await getValidInvitation(token)

    if (!invite) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0e0f14] px-4 py-6">
                <div className="panel rounded-lg w-[min(360px,92vw)] p-6 text-center">
                    <Logo />
                    <p className="mt-4 text-sm">This invitation is invalid or has expired.</p>
                    <p className="secondary-text mt-2 text-xs">Ask an admin to send you a new one.</p>
                </div>
            </div>
        )
    }

    // pass only what the form needs, not the whole row (no ids or status)
    return (
        <InviteForm
            token={token}
            email={invite.email}
            orgName={invite.organization.name}
            role={invite.role}
        />
    )
}