'use server'


import CreateOrg from '@/components/layout/AuthLayout/CreateOrg'
import { RequireOnboarding } from '@/src/lib/auth-utils'

export default async function page() {
    await RequireOnboarding()
    return (
        <CreateOrg />
    )
}
