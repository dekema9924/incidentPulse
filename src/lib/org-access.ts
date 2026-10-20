'use server'

// lib/org-access.ts
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { RequireDashboard } from './auth-utils'
import { Role } from '@/components/layout/settings/member/AllMembers'
import { slugify } from '@/utils/slugify'
import { Prisma } from '../generated/prisma/client'



const RESERVED_SLUGS = new Set([
    'dashboard', 'onboarding', 'auth', 'api', 'settings',
    'admin', 'status', 'invite', 'login', 'verify-email',
])

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



//get all emembers inb an organization
export async function getMembers(slug: string) {
    const { org } = await requireOrgAccess(slug) // 404s unless the caller belongs to this org
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



//get orgs a user is in
export const getUserOrgs = cache(async (userId: string) => {
    const rows = await prisma.membership.findMany({
        where: { userId },
        orderBy: { joinedAt: 'asc' },
        select: {
            role: true,
            organization: { select: { id: true, name: true, slug: true } },
        },
    })

    return rows.map(r => ({ ...r.organization, role: r.role }))
})


//create new org


type CreateOrgResult =
    | { success: true; slug: string }
    | { success: false; error: string }
export async function createOrganizationForUser(
    userId: string,
    input: { name: string; slug?: string }
): Promise<CreateOrgResult> {
    const name = input.name.trim()
    if (name.length < 2 || name.length > 60) {
        return { success: false, error: 'Organization name must be 2 to 60 characters.' }
    }

    let base = slugify(input.slug?.trim() || name)
    if (!base) {
        return { success: false, error: 'Please use at least one letter or number.' }
    }
    if (RESERVED_SLUGS.has(base)) base = `${base}-org`

    for (let attempt = 0; attempt < 5; attempt++) {
        const slug = attempt === 0 ? base : `${base}-${Math.floor(100 + Math.random() * 900)}`

        try {
            await prisma.organization.create({
                data: {
                    name,
                    slug,
                    memberships: { create: { userId, role: 'OWNER' } }, // org + Owner in one atomic write
                },
            })
            return { success: true, slug }
        } catch (e) {
            // P2002 = slug already taken, so try again with a suffix
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') continue
            console.error('createOrganizationForUser failed', e)
            return { success: false, error: 'Something went wrong. Please try again.' }
        }
    }

    return { success: false, error: 'That URL is taken. Try a different one.' }
}