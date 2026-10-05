'use server'

import DashboardHeader from '@/components/layout/Dashboard/DashboardHeader'
import { ReactNode } from 'react'
import { RequireAuth } from '@/src/lib/auth-utils'
import DashboardSideBar from '@/components/layout/Dashboard/DashboardSideBar'
import { DashboardContextProvider } from '@/context/DashboardContext'

export default async function Dashboardlayout({ children }: { children: ReactNode }) {

    await RequireAuth()   //protect dashboard route.


    return (
        <>
            <DashboardContextProvider>
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
        </>
    )
}
