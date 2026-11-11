// app/dashboard/[slug]/layout.tsx   (no 'use server')
import { ReactNode } from 'react'
import DashboardHeader from '@/components/layout/Dashboard/DashboardHeader'
import DashboardSideBar from '@/components/layout/Dashboard/DashboardSideBar'
import { DashboardContextProvider } from '@/context/DashboardContext'
import { getUserOrgs, requireOrgAccess } from '@/src/lib/dashboard/org-access'
import { OrgModalContextProvider } from '@/context/DashboardModals'
import RenderModals from '@/components/layout/Organization/RenderModals'
import { getMyInvitations } from '@/src/lib/dashboard/accept-invite'
import { prisma } from '@/src/lib/prisma'
import { ORG_LIMITS } from '@/src/lib/billing/plans'

export default async function DashboardLayout({
    children,
    params,
}: {
    children: ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const invites = await getMyInvitations()
    const inviteCount = invites.length   // no parentheses    // runs RequireDashboard() inside, then 404s unless this user belongs to this slug
    const { org, role, session } = await requireOrgAccess(slug)
    const orgs = await getUserOrgs(session.user.id)

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true },
    })

    const plan = user?.plan ?? 'FREE'
    const canCreateOrg = orgs.filter(o => o.role === 'OWNER').length < ORG_LIMITS[plan]




    return (
        <DashboardContextProvider org={org} plan={plan} canCreateOrg={canCreateOrg} orgs={orgs} role={role} inviteCount={inviteCount}>
            <OrgModalContextProvider>
                <div className="flex min-h-screen">
                    {/* Left side */}
                    <div className="min-h-screen">
                        <DashboardSideBar />
                    </div>

                    {/* Right side */}
                    <div className="flex-1">
                        <DashboardHeader />
                        {children}
                    </div>
                </div>
                <RenderModals />

            </OrgModalContextProvider>

        </DashboardContextProvider>
    )
}