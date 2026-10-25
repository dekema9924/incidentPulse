import type { Invitation } from '@/src/generated/prisma/client'
import { prisma } from '@/src/lib/prisma'

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