// src/lib/billing-actions.ts
'use server'

import { prisma } from '@/src/lib/prisma'
import { RequireAuth } from '../auth/auth-utils'
import { stripe } from '@/src/lib/stripe'
import { memberLimitFor, ORG_LIMITS, PlanName } from './plans'
import { requireOrgAccess } from '../dashboard/org-access'

type PaidPlan = 'TEAM' | 'LIFETIME'

// price IDs live on the server: the client only says which plan, never what it costs
const PRICE_IDS: Record<PaidPlan, string> = {
    TEAM: process.env.STRIPE_PRICE_TEAM!,
    LIFETIME: process.env.STRIPE_PRICE_LIFETIME!,
}

export const createCheckoutSession = async (input: {
    plan: PaidPlan
    seats: number
}): Promise<{ success: true; url: string } | { success: false; error: string }> => {
    const session = await RequireAuth()

    if (!session.user.emailVerified) {
        return { success: false, error: 'Verify your email first.' }
    }
    if (input.plan !== 'TEAM' && input.plan !== 'LIFETIME') {
        return { success: false, error: 'Invalid plan.' }
    }

    const isTeam = input.plan === 'TEAM'
    const seats = isTeam ? Math.min(100, Math.max(1, Math.floor(Number(input.seats) || 1))) : 1

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { plan: true, stripeCustomerId: true },
        })
        if (user?.plan === 'LIFETIME') {
            return { success: false, error: 'You already have the Lifetime plan.' }
        }

        if (user?.plan === 'TEAM' && input.plan === 'TEAM') {
            return { success: false, error: "You're already on Team. Change seats from billing." }
        }

        const metadata = { userId: session.user.id, plan: input.plan, seats: String(seats) }
        const app = process.env.NEXT_PUBLIC_APP_URL

        const checkout = await stripe.checkout.sessions.create({
            mode: isTeam ? 'subscription' : 'payment',
            line_items: [{ price: PRICE_IDS[input.plan], quantity: seats }],
            client_reference_id: session.user.id,
            metadata,
            ...(isTeam ? { subscription_data: { metadata } } : {}),
            ...(user?.stripeCustomerId
                ? { customer: user.stripeCustomerId }
                : { customer_email: session.user.email, ...(isTeam ? {} : { customer_creation: 'always' as const }) }),
            success_url: `${app}/dashboard?checkout=success`,
            cancel_url: `${app}/dashboard?checkout=cancelled`,
        })

        if (!checkout.url) return { success: false, error: 'Could not start checkout.' }
        return { success: true, url: checkout.url }
    } catch (e) {
        console.error('createCheckoutSession failed', e)
        return { success: false, error: 'Could not start checkout. Please try again.' }
    }
}





// get user billing plans
export type PlanSummary = {
    plan: PlanName                // the signed-in user's own plan
    ownedOrgs: number
    orgLimit: number | null         // null = unlimited
    isOwner: boolean
    // only filled in for owners and admins; members get null
    workspace: null | {
        plan: PlanName              // the plan covering this workspace: its OWNER's plan
        members: number
        pending: number
        limit: number | null        // null = unlimited
        seatsLeft: number | null    // null = unlimited
    }
}

// Infinity doesn't survive JSON, so send null for "unlimited"
const finite = (n: number) => (Number.isFinite(n) ? n : null)

export const getPlanSummary = async (slug: string): Promise<PlanSummary> => {
    const { session, org, role } = await requireOrgAccess(slug)
    const isAdmin = role === 'OWNER' || role === 'ADMIN'

    const [me, ownedOrgs] = await Promise.all([
        prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } }),
        prisma.membership.count({ where: { userId: session.user.id, role: 'OWNER' } }),
    ])
    const plan = (me?.plan ?? 'FREE') as PlanName

    let workspace: PlanSummary['workspace'] = null

    if (isAdmin) {
        const [owner, members, pending] = await Promise.all([
            prisma.membership.findFirst({
                where: { organizationId: org.id, role: 'OWNER' },
                select: { user: { select: { plan: true, seats: true } } },
            }),
            prisma.membership.count({ where: { organizationId: org.id } }),
            prisma.invitation.count({
                where: { organizationId: org.id, status: 'PENDING', expiresAt: { gt: new Date() } },
            }),
        ])

        // same rule inviteMember enforces, so the screen and the server agree
        const workspacePlan = (owner?.user.plan ?? 'FREE') as PlanName
        const limit = memberLimitFor(workspacePlan, owner?.user.seats ?? 0)

        workspace = {
            plan: workspacePlan,
            members,
            pending,
            limit: finite(limit),
            seatsLeft: Number.isFinite(limit) ? Math.max(0, limit - members - pending) : null,
        }
    }

    return {
        plan,
        ownedOrgs,
        orgLimit: finite(ORG_LIMITS[plan]),
        isOwner: role === 'OWNER',
        workspace,
    }
}