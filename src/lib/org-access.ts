'use server'

// lib/org-access.ts
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { RequireDashboard } from './auth-utils'
import { Role } from '@/components/layout/settings/member/AllMembers'

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



export async function getMembers(slug: string) {
    const { org } = await requireOrgAccess(slug) // 404s unless the caller belongs to this org
    console.log(org)
    const rows = await prisma.membership.findMany({
        where: { organizationId: org.id },
        orderBy: { joinedAt: 'asc' },
        select: {
            role: true,
            joinedAt: true,
            user: { select: { name: true, email: true } },
        },
    })

    return rows.map(m => ({
        name: m.user.name,
        email: m.user.email,
        role: (m.role.charAt(0) + m.role.slice(1).toLowerCase()) as Role, // "OWNER" → "Owner"
        joinedDate: m.joinedAt.toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
        }), // "24 Jun 2026"
    }))
}