'use server'
import { auth } from '@/src/lib/auth'
import { headers } from 'next/headers'
import React from 'react'

export default async function Dashboardpage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    console.log("DASHBOARD SESSION:", session);

    return (
        <>
            <main className='p-2'>
                Dashboard page
            </main>
        </>
    )
}
