'use server'
import { Prisma } from '../../generated/prisma/client'
import { RequireAuth, RequireDashboard, RequireOnboarding } from '../auth/auth-utils'
import { prisma } from '@/src/lib/prisma'
import { slugify } from '@/utils/string-concatenation'      // same function the form uses
import { createOrganizationForUser, requireOrgAccess } from './org-access'
import { SendInviteMail } from '@/utils/SendInviteMail'
import { generateInviteToken, hashToken } from '@/utils/invite-token'
import { memberLimitFor, memberLimitMessage, type PlanName } from '../billing/plans'

const RESERVED_SLUGS = new Set([
    'dashboard', 'onboarding', 'auth', 'api', 'settings',
    'admin', 'status', 'invite', 'login', 'verify-email',
])

type Result = { success: true; slug: string } | { success: false; error: string }


//create organization. first org
export async function createOrganization(input: { name: string; slug?: string }): Promise<Result> {
    const session = await RequireOnboarding() // signed in, verified, and has no org yet

    const name = input.name.trim()
    if (name.length < 2 || name.length > 60) {
        return { success: false, error: 'Organization name must be 2 to 60 characters.' }
    }

    let base = slugify(input.slug?.trim() || name)
    if (!base) {
        return { success: false, error: 'Please use at least one letter or number.' }
    }
    if (RESERVED_SLUGS.has(base)) base = `${base}-org`

    // Try the clean slug first, then add a random suffix if it's taken
    for (let attempt = 0; attempt < 5; attempt++) {
        const slug = attempt === 0 ? base : `${base}-${Math.floor(100 + Math.random() * 900)}`

        try {
            await prisma.organization.create({
                data: {
                    name,
                    slug,
                    // one query = org and owner membership are created together or not at all
                    memberships: {
                        create: { userId: session.user.id, role: 'OWNER' },
                    },
                },
            })
            return { success: true, slug }
        } catch (e) {
            // P2002 = unique constraint failed (slug taken), so try the next suffix
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') continue
            throw e
        }
    }

    return { success: false, error: 'That URL is taken. Try a different one.' }
}



// extra orgs, from the sidebar modal (requires signed in, verified, and already in an org)
export const createAdditionalOrganization = async (input: { name: string; slug?: string }) => {
    const session = await RequireDashboard()
    return createOrganizationForUser(session.user.id, input)
}


//update organization
type OrganizationResult =
    | { success: true; name: string; slug: string }
    | { success: false; error: string };

export const updateOrganization = async ({
    id,
    name,
    slug
}: {
    id: string
    name: string
    slug: string
}

): Promise<OrganizationResult> => {
    const session = await RequireAuth() // keep this outside try/catch: redirect() works by throwing

    const cleanName = name.trim()
    if (cleanName.length < 2 || cleanName.length > 60) {
        return { success: false, error: 'Organization name must be 2 to 60 characters.' }
    }

    const cleanSlug = slugify(slug)
    if (!cleanSlug) {
        return { success: false, error: 'Workspace URL needs at least one letter or number.' }
    }
    if (RESERVED_SLUGS.has(cleanSlug)) {
        return { success: false, error: 'That workspace URL is reserved. Try another.' }
    }

    try {
        // One query does the permission check and the update together.
        // It only matches if this user is an OWNER or ADMIN of this org.
        const result = await prisma.organization.updateMany({
            where: {
                id,
                memberships: {
                    some: { userId: session.user.id, role: { in: ['OWNER', 'ADMIN'] } },
                },
            },
            data: { name: cleanName, slug: cleanSlug },
        })

        if (result.count === 0) {
            return {
                success: false,
                error: "Workspace not found, or you don't have permission to change it.",
            }
        }

        return { success: true, name: cleanName, slug: cleanSlug }
    } catch (e) {
        // P2002 = unique constraint failed, so another workspace already has this slug
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            return { success: false, error: 'That workspace URL is already taken.' }
        }

        console.error('updateOrganization failed', e) // full error stays in your server logs
        return { success: false, error: 'Something went wrong. Please try again.' }
    }
}







//invite new member to org
const INVITE_ROLES = ['ADMIN', 'MEMBER', 'VIEWER'] as const // never OWNER
const EXPIRES_IN_DAYS = 7
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_PENDING_INVITES = 50
const MAX_INVITES_PER_HOUR = 20

type InviteResult =
    | { success: true }
    | { success: false; error: string; code?: 'MEMBER_LIMIT'; upgrade?: boolean }

// thrown inside the transaction so it rolls back (including the "revoke the old link" step)
class MemberLimitError extends Error {
    constructor(public plan: PlanName, public limit: number) {
        super('MEMBER_LIMIT')
    }
}

export const inviteMember = async (input: {
    slug: string
    email: string
    role: (typeof INVITE_ROLES)[number]
}): Promise<InviteResult> => {
    const { session, org, role: callerRole } = await requireOrgAccess(input.slug)

    // 1. permission
    if (callerRole !== 'OWNER' && callerRole !== 'ADMIN') {
        return { success: false, error: "You don't have permission to invite members." }
    }

    // 2. validate what the client sent
    const email = input.email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(email)) {
        return { success: false, error: 'Please enter a valid email address.' }
    }
    if (!INVITE_ROLES.includes(input.role)) {
        return { success: false, error: 'Invalid role.' }
    }
    // only the Owner can create admins
    if (input.role === 'ADMIN' && callerRole !== 'OWNER') {
        return { success: false, error: 'Only the owner can invite admins.' }
    }

    const callerIsOwner = callerRole === 'OWNER'

    try {
        // 3. rate limits, per workspace
        const now = new Date()
        const [pendingTotal, recent] = await Promise.all([
            prisma.invitation.count({
                where: { organizationId: org.id, status: 'PENDING', expiresAt: { gt: now }, email: { not: email } },
            }),
            prisma.invitation.count({
                where: { organizationId: org.id, createdAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) } },
            }),
        ])
        if (pendingTotal >= MAX_PENDING_INVITES) {
            return { success: false, error: 'Too many pending invitations. Revoke some or wait for them to expire.' }
        }
        if (recent >= MAX_INVITES_PER_HOUR) {
            return { success: false, error: "You've sent a lot of invitations recently. Please try again later." }
        }

        // 4. already a member?
        const existing = await prisma.membership.findFirst({
            where: { organizationId: org.id, user: { email } },
            select: { id: true },
        })
        if (existing) return { success: false, error: 'That person is already a member.' }

        // 5. the server creates the token and expiry
        const rawToken = generateInviteToken()
        const expiresAt = new Date(Date.now() + EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000)

        // 6. check the plan limit and create the invitation together
        let invitation: { id: string } | null = null

        for (let attempt = 0; attempt < 3 && !invitation; attempt++) {
            try {
                invitation = await prisma.$transaction(
                    async tx => {
                        // re-inviting the same email replaces the old link, so only one is ever valid
                        await tx.invitation.updateMany({
                            where: { organizationId: org.id, email, status: 'PENDING' },
                            data: { status: 'REVOKED' },
                        })

                        // the limit comes from the workspace OWNER's plan
                        const owner = await tx.membership.findFirst({
                            where: { organizationId: org.id, role: 'OWNER' },
                            select: { user: { select: { plan: true, seats: true } } },
                        })
                        const plan = (owner?.user.plan ?? 'FREE') as PlanName
                        const limit = memberLimitFor(plan, owner?.user.seats ?? 0)

                        const [members, pending] = await Promise.all([
                            tx.membership.count({ where: { organizationId: org.id } }),
                            tx.invitation.count({
                                where: { organizationId: org.id, status: 'PENDING', expiresAt: { gt: new Date() } },
                            }),
                        ])
                        if (members + pending >= limit) throw new MemberLimitError(plan, limit)

                        return tx.invitation.create({
                            data: {
                                email,
                                role: input.role,
                                token: hashToken(rawToken), // store the hash, never the raw token
                                expiresAt,
                                organizationId: org.id,
                                invitedById: session.user.id,
                            },
                            select: { id: true },
                        })
                    },
                    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
                )
            } catch (e) {
                if (e instanceof MemberLimitError) {
                    return {
                        success: false,
                        code: 'MEMBER_LIMIT',
                        // the upgrade modal only helps the owner on Free: admins and Team owners get instructions instead
                        upgrade: callerIsOwner && e.plan === 'FREE',
                        error: memberLimitMessage(e.plan, e.limit, callerIsOwner),
                    }
                }
                if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2034') continue // collided with another request: retry
                throw e
            }
        }

        if (!invitation) {
            return { success: false, error: 'Could not send the invitation right now. Please try again.' }
        }

        // 7. the server builds the link; the raw token only ever exists in this email
        const mail = await SendInviteMail({
            email,
            orgName: org.name,
            inviterName: session.user.name,
            role: input.role,
            inviteUrl: `${process.env.APP_URL}/auth/invite/${rawToken}`,
            expiresInDays: EXPIRES_IN_DAYS,
        })

        if (!mail.success) {
            await prisma.invitation.delete({ where: { id: invitation.id } }) // don't leave a pending invite nobody received
            return { success: false, error: "We couldn't send the email. Please try again." }
        }

        return { success: true }
    } catch (e) {
        console.error('inviteMember failed', e)
        return { success: false, error: 'Something went wrong. Please try again.' }
    }
}