// lib/org-access.ts
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { RequireDashboard } from './auth-utils'

// cache() = layout and page can both call this and it hits the DB once per request
const findMembership = cache(async (userId: string, slug: string) =>
    prisma.membership.findFirst({
        where: { userId, organization: { slug } },
        select: {
            role: true,
            organization: { select: { id: true, name: true, slug: true } },
        },
    })
)

export async function requireOrgAccess(slug: string) {
    const session = await RequireDashboard() // signed in, verified, has at least one org
    const membership = await findMembership(session.user.id, slug)

    if (!membership) notFound()

    return { session, role: membership.role, org: membership.organization }
}