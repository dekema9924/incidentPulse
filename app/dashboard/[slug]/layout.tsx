// app/dashboard/[slug]/layout.tsx   (no 'use server')
import { ReactNode } from 'react'
import DashboardHeader from '@/components/layout/Dashboard/DashboardHeader'
import DashboardSideBar from '@/components/layout/Dashboard/DashboardSideBar'
import { DashboardContextProvider } from '@/context/DashboardContext'
import { requireOrgAccess } from '@/src/lib/org-access'

export default async function DashboardLayout({
    children,
    params,
}: {
    children: ReactNode
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    // runs RequireDashboard() inside, then 404s unless this user belongs to this slug
    const { org, role } = await requireOrgAccess(slug)

    return (
        <DashboardContextProvider org={org} role={role}>
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
        </DashboardContextProvider>
    )
}