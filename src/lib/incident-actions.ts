'use server'

import { prisma } from '@/src/lib/prisma'
import { requireOrgAccess } from '@/src/lib/org-access'
import { ESCALATION_SLA_MS } from '@/utils/constants'
import { success } from 'better-auth'






//create incident
const SEVERITIES = ['P1', 'P2', 'P3'] as const
type Severity = (typeof SEVERITIES)[number]

type CreateIncidentResult =
    | { success: true; id: string; number: number }
    | { success: false; error: string }

// Prisma's "unique constraint failed" error code, checked without importing the Prisma namespace
const isUniqueViolation = (e: unknown) =>
    typeof e === 'object' && e !== null && 'code' in e && (e as { code?: string }).code === 'P2002'

export const createIncident = async (input: {
    slug: string
    title: string
    severity: Severity
}): Promise<CreateIncidentResult> => {
    // 1. who is calling, and do they belong to this org?
    // Keep this outside try/catch: notFound() and redirect() work by throwing.
    const { session, org, role } = await requireOrgAccess(input.slug)

    if (role === 'VIEWER') {
        return { success: false, error: 'Viewers have read-only access.' }
    }

    // 2. validate what the client sent
    const title = input.title.trim().replace(/\s+/g, ' ')
    if (title.length < 1 || title.length > 120) {
        return { success: false, error: 'Title must be 1 to 120 characters.' }
    }
    if (!SEVERITIES.includes(input.severity)) {
        return { success: false, error: 'Invalid severity.' }
    }

    try {
        // 3. next INC number for this org; retry if two people create at the same moment
        for (let attempt = 0; attempt < 3; attempt++) {
            const last = await prisma.incident.findFirst({
                where: { organizationId: org.id },
                orderBy: { number: 'desc' },
                select: { number: true },
            })
            const number = (last?.number ?? 0) + 1

            try {
                const incident = await prisma.incident.create({
                    data: {
                        number,
                        title,
                        severity: input.severity,
                        organizationId: org.id,
                        // nested create: the incident and its first timeline entry are written together
                        timeline: {
                            create: {
                                type: 'SYSTEM',
                                text: 'Incident opened.',
                                authorId: session.user.id,
                            },
                        },
                    },
                    select: { id: true, number: true },
                })

                // TODO: emit to the org's Socket.io room so every open queue updates live

                return { success: true, id: incident.id, number: incident.number }
            } catch (e) {
                if (isUniqueViolation(e)) continue // someone else took this number, read again
                throw e
            }
        }

        return { success: false, error: 'Could not create the incident right now. Please try again.' }
    } catch (e) {
        console.error('createIncident failed', e)
        return { success: false, error: 'Something went wrong. Please try again.' }
    }
}





// fetch all Incidents

const STATUS_LABEL = {
    INVESTIGATING: 'Investigating',
    IDENTIFIED: 'Identified',
    MONITORING: 'Monitoring',
    RESOLVED: 'Resolved',
} as const

const EVENT_TYPE = {
    MESSAGE: 'msg',
    SYSTEM: 'system',
    ESCALATION: 'escalation',
    RESOLVE: 'resolve',
} as const

export type IncidentListItem = {
    id: string
    code: string                 // "INC-2041"
    title: string
    severity: 'P1' | 'P2' | 'P3'
    status: (typeof STATUS_LABEL)[keyof typeof STATUS_LABEL]
    opened: number               // ms timestamp
    acked: boolean
    escalated: boolean
    resolvedAt: number | null
    assignee: string | null
    assigneeId: string | null
    escalatesAt: number | null   // ms timestamp, only while a P1 is waiting for a first response
}


//get all incidents in org
export const getIncidents = async (slug: string): Promise<IncidentListItem[]> => {
    // 404s unless the caller belongs to this org; every role (including Viewer) may read
    const { org } = await requireOrgAccess(slug)

    const rows = await prisma.incident.findMany({
        where: { organizationId: org.id }, // always scoped by the verified org, never by client input
        orderBy: { createdAt: 'desc' },
        take: 100, // add paging later; the queue doesn't need years of history
        select: {
            id: true,
            number: true,
            title: true,
            severity: true,
            status: true,
            createdAt: true,
            acknowledgedAt: true,
            escalatedAt: true,
            resolvedAt: true,
            assignee: { select: { id: true, name: true } },
        },
    })

    return rows.map(r => ({
        id: r.id,
        code: `INC-${r.number}`,
        title: r.title,
        severity: r.severity,
        status: STATUS_LABEL[r.status],
        opened: r.createdAt.getTime(),
        acked: r.acknowledgedAt !== null,
        escalated: r.escalatedAt !== null,
        resolvedAt: r.resolvedAt?.getTime() ?? null,
        assignee: r.assignee?.name ?? null,
        assigneeId: r.assignee?.id ?? null,
        escalatesAt:
            r.severity === 'P1' && !r.acknowledgedAt && !r.escalatedAt && r.status !== 'RESOLVED'
                ? r.createdAt.getTime() + ESCALATION_SLA_MS
                : null,
    }))
}

// timeline + pending assignment requests for the one incident that is open
export const getIncident = async (slug: string, incidentId: string) => {
    const { org, role, session } = await requireOrgAccess(slug)
    const isAdmin = role === 'OWNER' || role === 'ADMIN'

    const row = await prisma.incident.findFirst({
        where: { id: incidentId, organizationId: org.id }, // an ID from another org simply matches nothing
        select: {
            timeline: {
                orderBy: { createdAt: 'asc' },
                select: {
                    id: true,
                    type: true,
                    text: true,
                    createdAt: true,
                    source: true,
                    author: { select: { name: true } },
                },
            },
            requests: {
                where: { status: 'PENDING' },
                select: { user: { select: { id: true, name: true } } },
            },
        },
    })

    if (!row) return null

    return {
        timeline: row.timeline.map(e => ({
            id: e.id,
            author: e.author?.name ?? e.source ?? 'System', // PagerDuty, Datadog, System...
            text: e.text,
            time: e.createdAt.getTime(),
            type: EVENT_TYPE[e.type],
        })),
        // only admins see who asked; members just learn whether they already asked
        requests: isAdmin ? row.requests.map(r => ({ id: r.user.id, name: r.user.name })) : [],
        requestedByMe: row.requests.some(r => r.user.id === session.user.id),
    }
}




//resolve incident

type Result = { success: true } | { success: false; error: string }

export const updateIncidentStatus = async (input: {
    slug: string
    incidentId: string
    action: 'acknowledge' | 'resolve'
}): Promise<Result> => {
    const { session, org, role } = await requireOrgAccess(input.slug)

    if (role === 'VIEWER') {
        return { success: false, error: 'Viewers have read-only access.' }
    }
    if (input.action !== 'acknowledge' && input.action !== 'resolve') {
        return { success: false, error: 'Invalid action.' }
    }

    const isResolve = input.action === 'resolve'
    const isAdmin = role === 'OWNER' || role === 'ADMIN'
    const now = new Date()

    try {
        const changed = await prisma.$transaction(async tx => {
            const claimed = await tx.incident.updateMany({
                where: {
                    id: input.incidentId,
                    organizationId: org.id,
                    status: { not: 'RESOLVED' },
                    // resolving: admins always; everyone else only if it's assigned to them
                    ...(isResolve && !isAdmin ? { assigneeId: session.user.id } : {}),
                    ...(isResolve ? {} : { acknowledgedAt: null }),
                },
                data: isResolve ? { status: 'RESOLVED', resolvedAt: now } : { acknowledgedAt: now },
            })
            if (claimed.count === 0) return false

            if (isResolve) {
                await tx.incident.updateMany({
                    where: { id: input.incidentId, acknowledgedAt: null },
                    data: { acknowledgedAt: now },
                })
            }

            await tx.timelineEvent.create({
                data: {
                    incidentId: input.incidentId,
                    authorId: session.user.id,
                    type: isResolve ? 'RESOLVE' : 'MESSAGE',
                    text: isResolve ? 'Marked resolved.' : 'Acknowledged.',
                },
            })
            return true
        })

        if (!changed) {
            // nothing matched: read once to give the right reason
            const incident = await prisma.incident.findFirst({
                where: { id: input.incidentId, organizationId: org.id },
                select: { status: true, assigneeId: true },
            })
            if (!incident) return { success: false, error: 'Incident not found.' }
            if (incident.status === 'RESOLVED') {
                return { success: false, error: 'This incident is already resolved.' }
            }
            if (isResolve && !isAdmin && incident.assigneeId !== session.user.id) {
                return { success: false, error: 'Only the assignee or an admin can resolve this incident.' }
            }
            return { success: false, error: 'This incident was already acknowledged.' }
        }

        return { success: true }
    } catch (e) {
        console.error('updateIncidentStatus failed', e)
        return { success: false, error: 'Something went wrong. Please try again.' }
    }
}






type ActionResult = { success: true } | { success: false; error: string }

// people who can be assigned (Viewers can't work incidents)
export const getOrgMembers = async (slug: string) => {
    const { org } = await requireOrgAccess(slug)

    const rows = await prisma.membership.findMany({
        where: { organizationId: org.id, role: { not: 'VIEWER' } },
        orderBy: { joinedAt: 'asc' },
        select: { user: { select: { id: true, name: true } } },
    })
    return rows.map(r => ({ id: r.user.id, name: r.user.name }))
}
//assign incidents
// userId = null means "unassign"
export const assignIncident = async (input: {
    slug: string
    incidentId: string
    userId: string | null
}): Promise<ActionResult> => {
    const { session, org, role } = await requireOrgAccess(input.slug)

    if (role !== 'OWNER' && role !== 'ADMIN') {
        return { success: false, error: 'Only owners and admins can assign incidents.' }
    }

    try {
        let assigneeName: string | null = null

        if (input.userId) {
            // the person must belong to THIS org and be allowed to work incidents
            const member = await prisma.membership.findFirst({
                where: { organizationId: org.id, userId: input.userId, role: { not: 'VIEWER' } },
                select: { user: { select: { name: true } } },
            })
            if (!member) return { success: false, error: 'That person cannot be assigned to incidents.' }
            assigneeName = member.user.name
        }

        const changed = await prisma.$transaction(async tx => {
            const res = await tx.incident.updateMany({
                where: { id: input.incidentId, organizationId: org.id, status: { not: 'RESOLVED' } },
                data: { assigneeId: input.userId },
            })
            if (res.count === 0) return false

            // this decision settles the requests: the chosen person is approved, the rest declined
            if (input.userId) {
                await tx.incidentRequest.updateMany({
                    where: { incidentId: input.incidentId, userId: input.userId, status: 'PENDING' },
                    data: { status: 'APPROVED' },
                })
            }
            await tx.incidentRequest.updateMany({
                where: { incidentId: input.incidentId, status: 'PENDING' },
                data: { status: 'DECLINED' },
            })

            await tx.timelineEvent.create({
                data: {
                    incidentId: input.incidentId,
                    authorId: session.user.id,
                    type: 'SYSTEM',
                    text: assigneeName ? `Assigned to ${assigneeName}.` : 'Unassigned.',
                },
            })
            return true
        })

        if (!changed) return { success: false, error: 'Incident not found, or it is already resolved.' }
        return { success: true }
    } catch (e) {
        console.error('assignIncident failed', e)
        return { success: false, error: 'Something went wrong. Please try again.' }
    }
}


//request incident
export const requestIncident = async (input: {
    slug: string
    incidentId: string
}): Promise<ActionResult> => {
    const { session, org, role } = await requireOrgAccess(input.slug)

    if (role === 'VIEWER') return { success: false, error: 'Viewers have read-only access.' }

    try {
        const incident = await prisma.incident.findFirst({
            where: { id: input.incidentId, organizationId: org.id },
            select: { status: true, assigneeId: true },
        })
        if (!incident) return { success: false, error: 'Incident not found.' }
        if (incident.status === 'RESOLVED') return { success: false, error: 'This incident is already resolved.' }
        if (incident.assigneeId === session.user.id) {
            return { success: false, error: "You're already assigned to this incident." }
        }

        const key = { incidentId_userId: { incidentId: input.incidentId, userId: session.user.id } }
        const existing = await prisma.incidentRequest.findUnique({ where: key })
        if (existing?.status === 'PENDING') return { success: true } // already asked: don't duplicate the timeline line

        await prisma.$transaction([
            prisma.incidentRequest.upsert({
                where: key,
                update: { status: 'PENDING' },
                create: { incidentId: input.incidentId, userId: session.user.id },
            }),
            prisma.timelineEvent.create({
                data: {
                    incidentId: input.incidentId,
                    authorId: session.user.id,
                    type: 'MESSAGE',
                    text: 'Requested to work on this incident.',
                },
            }),
        ])
        return { success: true }
    } catch (e) {
        console.error('requestIncident failed', e)
        return { success: false, error: 'Something went wrong. Please try again.' }
    }
}