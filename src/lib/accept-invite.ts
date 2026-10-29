'use server'
import type { Invitation } from '@/src/generated/prisma/client'
import { prisma } from '@/src/lib/prisma'
import { requireOrgAccess } from './org-access'

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

