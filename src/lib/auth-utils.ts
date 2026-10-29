'use server'

import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from '@/src/lib/prisma'
import { cache } from "react";


// cache() = one session lookup per request, even if several guards call it
const getSession = cache(async () =>
    auth.api.getSession({ headers: await headers() })
)

const getOrgCount = cache(async (userId: string) =>
    prisma.membership.count({ where: { userId } })
)



//check if user authenticated
export const RequireAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/auth/sign-in')
    }

    return session

}



//redirect verified users only
export async function RedirectIfVerified() {
    const session = await getSession()
    if (!session?.user.emailVerified) return

    const orgs = await getOrgCount(session.user.id)
    redirect(orgs === 0 ? '/onboarding/organization' : '/dashboard')
}

// /onboarding/organization page: verified AND has an org
export const RequireOnboarding = async () => {
    const session = await RequireAuth()

    if (!session.user.emailVerified) redirect('/verify-email')
    if ((await getOrgCount(session.user.id)) > 0) redirect('/dashboard')

    return session
}



// /dashboard layout: verified AND has no org
export const RequireDashboard = async () => {
    const session = await RequireAuth()

    if (!session.user.emailVerified) redirect('/verify-email')
    if ((await getOrgCount(session.user.id)) === 0) redirect('/onboarding/organization')

    return session
}





// I called them here

// /verify-email	await RedirectIfVerified()
// /onboarding/organization	await RequireOnboarding()
// /dashboard (layout)	await RequireDashboard()