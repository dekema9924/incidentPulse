'use server'

import { prisma } from "@/src/lib/prisma"
import { hashToken } from "./invite-token"



export const findInvitationByToken = async (token: string) =>
    await prisma.invitation.findUnique({
        where: { token: hashToken(token) }, // callers pass the raw token and never touch hashing
        select: {
            id: true,
            email: true,
            role: true,
            status: true,
            expiresAt: true,
            organizationId: true,
            organization: { select: { name: true, slug: true } },
        },
    })




export async function getValidInvitation(token: string) {
    const invite = await findInvitationByToken(token)

    if (!invite || invite.status !== 'PENDING' || invite.expiresAt < new Date()) {
        return null
    }

    return invite
}