'use server'

// lib/org-access.ts
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { RequireDashboard } from '../auth/auth-utils'
import { Role } from '@/components/layout/settings/member/AllMembers'
import { slugify } from '@/utils/string-concatenation'
import { Prisma } from '../../generated/prisma/client'
import { ORG_LIMITS, orgLimitMessage, type PlanName } from '../billing/plans'


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


// src/lib/create-org.ts   (plain module, never 'use server': it takes a userId)

export type CreateOrgResult =
    | { success: true; slug: string }
    | { success: false; error: string; code?: 'ORG_LIMIT' }

// thrown inside the transaction: it rolls everything back, and the catch below turns it into a normal result
class OrgLimitError extends Error {
    constructor(public plan: PlanName) {
        super('ORG_LIMIT')
    }
}
class UserMissingError extends Error { }

const isPrismaError = (e: unknown, code: string) =>
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === code

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

    let slugTaken = false

    for (let attempt = 0; attempt < 5; attempt++) {
        const slug = attempt === 0 ? base : `${base}-${Math.floor(100 + Math.random() * 900)}`

        try {
            await prisma.$transaction(
                async tx => {
                    const user = await tx.user.findUnique({
                        where: { id: userId },
                        select: { plan: true },
                    })
                    if (!user) throw new UserMissingError()

                    // only organizations they OWN count; ones they were invited into don't
                    const owned = await tx.membership.count({ where: { userId, role: 'OWNER' } })
                    if (owned >= ORG_LIMITS[user.plan]) throw new OrgLimitError(user.plan)

                    await tx.organization.create({
                        data: {
                            name,
                            slug,
                            memberships: { create: { userId, role: 'OWNER' } }, // org + Owner, written together
                        },
                    })
                },
                { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
            )

            return { success: true, slug }
        } catch (e) {
            if (e instanceof OrgLimitError) {
                return { success: false, code: 'ORG_LIMIT', error: orgLimitMessage(e.plan) }
            }
            if (e instanceof UserMissingError) {
                return { success: false, error: 'Account not found.' }
            }
            if (isPrismaError(e, 'P2002')) {
                slugTaken = true // slug already used: try again with a suffix
                continue
            }
            if (isPrismaError(e, 'P2034')) continue // two requests collided: retry once more

            console.error('createOrganizationForUser failed', e)
            return { success: false, error: 'Something went wrong. Please try again.' }
        }
    }

    return {
        success: false,
        error: slugTaken
            ? 'That URL is taken. Try a different one.'
            : 'Could not create the organization right now. Please try again.',
    }
}