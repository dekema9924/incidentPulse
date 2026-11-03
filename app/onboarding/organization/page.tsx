'use server'


import CreateOrg from '@/components/layout/AuthLayout/CreateOrg'
import Inbox from '@/components/layout/Dashboard/Inbox'
import { getMyInvitations } from '@/src/lib/accept-invite'
import { RequireOnboarding } from '@/src/lib/auth-utils'

export default async function page() {
    const invites = await getMyInvitations()
    await RequireOnboarding()
    return (
        <>
            {invites.length > 0 && <Inbox />}   {/*  an invitation" above the create-org form */}
            <CreateOrg />
        </>
    )
}
