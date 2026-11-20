// src/lib/escalation.ts
import { prisma } from '@/src/lib/prisma'
import { ESCALATION_SLA_MS } from '@/utils/constants'
import { SendEscalationMail } from './SendEscalationMail'


export async function runEscalationCheck() {
    const cutoff = new Date(Date.now() - ESCALATION_SLA_MS)

    const overdue = await prisma.incident.findMany({
        where: {
            severity: 'P1',
            status: { not: 'RESOLVED' },
            acknowledgedAt: null,
            escalatedAt: null,
            createdAt: { lte: cutoff },
        },
        select: {
            id: true,
            number: true,
            title: true,
            createdAt: true,
            organizationId: true,
            organization: { select: { name: true, slug: true } },
        },
    })

    for (const inc of overdue) {
        try {
            const escalated = await prisma.$transaction(async tx => {
                // same conditions again: if someone acknowledged a second ago, this matches nothing
                const claimed = await tx.incident.updateMany({
                    where: { id: inc.id, status: { not: 'RESOLVED' }, acknowledgedAt: null, escalatedAt: null },
                    data: { escalatedAt: new Date() },
                })
                if (claimed.count === 0) return false

                await tx.timelineEvent.create({
                    data: {
                        incidentId: inc.id,
                        type: 'ESCALATION',
                        source: 'System',
                        text: 'Escalation triggered: no acknowledgment within SLA. Paged Tier 2.',
                    },
                })
                return true
            })

            if (!escalated) continue

            // who gets paged: this org's owners and admins
            const recipients = await prisma.membership.findMany({
                where: { organizationId: inc.organizationId, role: { in: ['OWNER', 'ADMIN'] } },
                select: { user: { select: { email: true } } },
            })
            const emails = recipients.map(r => r.user.email)

            if (emails.length > 0) {
                await SendEscalationMail({
                    to: emails,
                    code: `INC-${inc.number}`,
                    title: inc.title,
                    orgName: inc.organization.name,
                    minutesOpen: Math.round((Date.now() - inc.createdAt.getTime()) / 60000),
                    dashboardUrl: `${process.env.APP_URL}/dashboard/${inc.organization.slug}`,
                })
            }

            // TODO: emit to Socket.io rooms incident:<id> and org:<organizationId>
        } catch (e) {
            // log and keep going: one failing incident must not stop the others from escalating
            console.error(`Escalation failed for ${inc.id}`, e)
        }
    }
}




const ARCHIVE_AFTER_DAYS = 14

export async function archiveOldResolved() {
    const cutoff = new Date(Date.now() - ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000)

    const res = await prisma.incident.updateMany({
        where: { status: 'RESOLVED', archivedAt: null, resolvedAt: { lte: cutoff } },
        data: { archivedAt: new Date() },
    })
    return res.count
}