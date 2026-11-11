// src/lib/billing-actions.ts
'use server'

import { prisma } from '@/src/lib/prisma'
import { RequireAuth } from '../auth/auth-utils'
import { stripe } from '@/src/lib/stripe'

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