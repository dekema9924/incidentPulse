'use server'
import { Prisma } from '../generated/prisma/client'
import { RequireAuth, RequireDashboard, RequireOnboarding } from './auth-utils'
import { prisma } from '@/src/lib/prisma'
import { slugify } from '@/utils/slugify'      // same function the form uses
import { createOrganizationForUser, requireOrgAccess } from './org-access'
import { SendInviteMail } from '@/utils/SendInviteMail'
import { generateInviteToken, hashToken } from '@/utils/invite-token'

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

type InviteResult = { success: true } | { success: false; error: string }

export const inviteMember = async (input: {
    slug: string
    email: string
    role: (typeof INVITE_ROLES)[number]
}): Promise<InviteResult> => {
    const { session, org, role: callerRole } = await requireOrgAccess(input.slug)

    // 1. permission: the hidden button isn't security, this is
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

    try {
        // 3. already a member?
        const existing = await prisma.membership.findFirst({
            where: { organizationId: org.id, user: { email } },
            select: { id: true },
        })
        if (existing) {
            return { success: false, error: 'That person is already a member.' }
        }

        //policy decision
        if (input.role === 'ADMIN' && callerRole !== 'OWNER') {
            return { success: false, error: "That person is alreasy an admin." }
        }

        // 4. the server creates the token and the expiry
        const rawToken = generateInviteToken()
        const expiresAt = new Date(Date.now() + EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000)

        // re-inviting the same email replaces the old link, so only one is ever valid
        const invitation = await prisma.$transaction(async tx => {
            await tx.invitation.updateMany({
                where: { organizationId: org.id, email, status: 'PENDING' },
                data: { status: 'REVOKED' },
            })
            return tx.invitation.create({
                data: {
                    email,
                    role: input.role,
                    token: hashToken(rawToken), // store the hash, never the raw token
                    expiresAt,
                    organizationId: org.id,
                    invitedById: session.user.id,
                },
            })
        })

        // 5. the server builds the link, and the raw token only ever exists in this email
        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${rawToken}`

        const mail = await SendInviteMail({
            email,
            orgName: org.name,
            inviterName: session.user.name,
            role: input.role,
            inviteUrl,
            expiresInDays: EXPIRES_IN_DAYS,
        })

        if (!mail.success) {
            // don't leave a "pending" invitation nobody received
            await prisma.invitation.delete({ where: { id: invitation.id } })
            return { success: false, error: "We couldn't send the email. Please try again." }
        }

        return { success: true }
    } catch (e) {
        console.error('inviteMember failed', e)
        return { success: false, error: 'Something went wrong. Please try again.' }
    }
}
