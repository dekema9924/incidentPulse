// app/api/stripe/webhook/route.ts
import Stripe from 'stripe'
import { prisma } from '@/src/lib/prisma'
import { stripe } from '@/src/lib/stripe'

export async function POST(req: Request) {
    const body = await req.text() // the raw body is required to verify the signature
    const signature = req.headers.get('stripe-signature')

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch {
        return new Response('Invalid signature', { status: 400 })
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const s = event.data.object as Stripe.Checkout.Session
            if (s.payment_status !== 'paid') break

            const userId = s.client_reference_id
            const plan = s.metadata?.plan
            if (!userId || (plan !== 'TEAM' && plan !== 'LIFETIME')) break

            const seats = plan === 'TEAM' ? Math.max(1, Number(s.metadata?.seats) || 1) : 0
            await prisma.user.update({
                where: { id: userId },
                data: {
                    plan,
                    seats,
                    ...(typeof s.customer === 'string' ? { stripeCustomerId: s.customer } : {}),
                },
            })
            break
        }

        case 'customer.subscription.deleted': {
            const sub = event.data.object as Stripe.Subscription
            // only downgrade Team: a Lifetime buyer who once had a subscription keeps their plan
            await prisma.user.updateMany({
                where: { stripeCustomerId: sub.customer as string, plan: 'TEAM' },
                data: { plan: 'FREE', seats: 0 },
            })
            break
        }
    }

    return new Response('ok')
}