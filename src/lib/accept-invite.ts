'use server'
import type { Invitation } from '@/src/generated/prisma/client'
import { prisma } from '@/src/lib/prisma'
import { requireOrgAccess } from './org-access'
import { RequireAuth } from './auth-utils'

export async function claimInvitation(
    userId: string,
    invite: Pick<Invitation, 'id' | 'organizationId' | 'role'>
) {
    await prisma.$transaction(async tx => {
        // claim it first, so two simultaneous requests can't both succeed
        const claimed = await tx.invitation.updateMany({
            where: { id: invite.id, status: 'PENDING', expiresAt: { gt: new Date() } },
            data: { status: 'ACCEPTED' },
        })
        if (claimed.count === 0) throw new Error('INVITE_UNAVAILABLE')

        await tx.membership.upsert({
            where: { userId_organizationId: { userId, organizationId: invite.organizationId } },
            update: {}, // already a member: keep their current role
            create: { userId, organizationId: invite.organizationId, role: invite.role },
        })
    })
}



// get pending invites
export async function getPendingInvites(slug: string) {
    const { org, role } = await requireOrgAccess(slug)
    if (role !== 'OWNER' && role !== 'ADMIN') return []

    const rows = await prisma.invitation.findMany({
        where: { organizationId: org.id, status: 'PENDING', expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            role: true,
            expiresAt: true,
            invitedBy: { select: { name: true } },
            // never select `token`: nothing about it should reach the browser
        },
    })

    return rows.map(r => ({
        id: r.id,
        email: r.email,
        role: r.role as string,
        invitedBy: r.invitedBy.name,
        daysLeft: Math.max(1, Math.ceil((r.expiresAt.getTime() - Date.now()) / 86_400_000)),
    }))
}



//revoke invite
export async function revokeInvitation(slug: string, invitationId: string) {
    const { org, role } = await requireOrgAccess(slug)
    if (role !== 'OWNER' && role !== 'ADMIN') {
        return { success: false as const, error: "You don't have permission to do that." }
    }

    // scoped by org.id, so an admin can't revoke another workspace's invitation by guessing an ID
    const res = await prisma.invitation.updateMany({
        where: { id: invitationId, organizationId: org.id, status: 'PENDING' },
        data: { status: 'REVOKED' },
    })
    if (res.count === 0) return { success: false as const, error: 'Invitation not found.' }

    return { success: true as const }
}





//////
export const getMyInvitations = async () => {
    const session = await RequireAuth()

    // an unverified address could belong to anyone, so it must never see someone else's invites
    if (!session.user.emailVerified) return []

    const rows = await prisma.invitation.findMany({
        where: {
            email: { equals: session.user.email, mode: 'insensitive' },
            status: 'PENDING',
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            role: true,
            expiresAt: true,
            organization: { select: { name: true } },
            invitedBy: { select: { name: true } },
            // never select the token
        },
    })

    return rows.map(r => ({
        id: r.id,
        orgName: r.organization.name,
        role: r.role as string,
        invitedBy: r.invitedBy.name,
        daysLeft: Math.max(1, Math.ceil((r.expiresAt.getTime() - Date.now()) / 86_400_000)),
    }))
}

export const respondToInvitation = async (input: {
    invitationId: string
    decision: 'accept' | 'decline'
}): Promise<{ success: true; slug: string | null } | { success: false; error: string }> => {
    const session = await RequireAuth()

    if (!session.user.emailVerified) {
        return { success: false, error: 'Verify your email first.' }
    }

    // the invitation must be addressed to THIS user's email: an ID alone proves nothing
    const invite = await prisma.invitation.findFirst({
        where: {
            id: input.invitationId,
            email: { equals: session.user.email, mode: 'insensitive' },
        },
        select: {
            id: true,
            role: true,
            status: true,
            expiresAt: true,
            organizationId: true,
            organization: { select: { slug: true } },
        },
    })

    if (!invite || invite.status !== 'PENDING' || invite.expiresAt < new Date()) {
        return { success: false, error: 'This invitation is no longer available.' }
    }


    try {
        if (input.decision === 'decline') {
            await prisma.invitation.updateMany({
                where: { id: invite.id, status: 'PENDING' },
                data: { status: 'DECLINED' },
            })
            return { success: true, slug: null }
        }

        await claimInvitation(session.user.id, invite) // atomic: marks ACCEPTED and creates the membership
        return { success: true, slug: invite.organization.slug }
    } catch (e) {
        console.error('respondToInvitation failed', e)
        return { success: false, error: 'This invitation is no longer available.' }
    }
}