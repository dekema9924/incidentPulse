// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { RequireDashboard } from '@/src/lib/auth-utils'
import { prisma } from '@/src/lib/prisma'

export default async function DashboardIndex() {
    const session = await RequireDashboard()

    const membership = await prisma.membership.findFirst({
        where: { userId: session.user.id },
        orderBy: { joinedAt: 'asc' },
        select: { organization: { select: { slug: true } } },
    })

    if (!membership) redirect('/onboarding/organization')
    redirect(`/dashboard/${membership.organization.slug}`)
}