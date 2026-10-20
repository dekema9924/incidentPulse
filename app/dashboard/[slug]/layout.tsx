// app/dashboard/[slug]/layout.tsx   (no 'use server')
import { ReactNode } from 'react'
import DashboardHeader from '@/components/layout/Dashboard/DashboardHeader'
import DashboardSideBar from '@/components/layout/Dashboard/DashboardSideBar'
import { DashboardContextProvider } from '@/context/DashboardContext'
import { getUserOrgs, requireOrgAccess } from '@/src/lib/org-access'
import { OrgModalContextProvider } from '@/context/DashboardModals'
import RenderNewOrgModal from '@/components/layout/Organization/RenderNewOrgModal'

export default async function DashboardLayout({
    children,
    params,
}: {
    children: ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    // runs RequireDashboard() inside, then 404s unless this user belongs to this slug
    const { org, role, session } = await requireOrgAccess(slug)
    const orgs = await getUserOrgs(session.user.id)

    return (
        <DashboardContextProvider org={org} orgs={orgs} role={role}>
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
                <RenderNewOrgModal />

            </OrgModalContextProvider>

        </DashboardContextProvider>
    )
}