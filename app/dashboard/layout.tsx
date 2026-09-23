'use server'

import DashboardHeader from '@/components/layout/DashboardHeader'
import { ReactNode } from 'react'
import { RequireAuth } from '@/src/lib/auth-utils'

export default async function Dashboardlayout({ children }: { children: ReactNode }) {

    await RequireAuth()   //protect dashboard route.


    return (
        <>
            <div className=''>
                <DashboardHeader />
                {children}
            </div>
        </>
    )
}
