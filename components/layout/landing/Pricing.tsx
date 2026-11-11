// components/landing/Pricing.tsx
import { Check, Minus } from 'lucide-react'
import ButtonLink from './ButtonLink'
import SectionHeading from './SectionHeading'
import { ROUTES } from './constants'

type Feature = { text: string; off?: boolean }

const PLANS: {
    name: string
    price: string
    unit: string
    blurb: string
    cta: string
    href: string
    featured: boolean
    features: Feature[]
}[] = [
        {
            name: 'Free',
            price: '$0',
            unit: 'forever',
            blurb: 'See how it works before you pay.',
            cta: 'Start free',
            href: `${ROUTES.signUp}?plan=free`,
            featured: false,
            features: [
                { text: '1 organization' },
                { text: 'Up to 3 members per workspace' },
                { text: 'Live timelines and escalation' },
                { text: 'More organizations and members', off: true },
            ],
        },
        {
            name: 'Team',
            price: '$12',
            unit: 'per member / month',
            blurb: 'For teams running incident response together.',
            cta: 'Choose Team',
            href: `${ROUTES.signUp}?plan=team`,
            featured: true,
            features: [
                { text: 'Up to 5 organizations' },
                { text: 'Owner, admin, member and viewer roles' },
                { text: 'Live timelines and automatic escalation' },
                { text: 'Email invitations for your team' },
            ],
        },
        {
            name: 'Lifetime',
            price: '$199',
            unit: 'one payment',
            blurb: 'Pay once and keep it.',
            cta: 'Get Lifetime',
            href: `${ROUTES.signUp}?plan=lifetime`,
            featured: false,
            features: [
                { text: 'Unlimited organizations' },
                { text: 'No recurring charges' },
                { text: 'Everything in Team' },
            ],
        },
    ]

export default function Pricing() {
    return (
        <section id="pricing" className="scroll-mt-20 border-t border-[#262B36] bg-[#0b0d11]">
            <div className="mx-auto max-w-6xl px-4 py-20">
                <SectionHeading
                    eyebrow="Pricing"
                    title="Start free, or take the whole thing"
                    description="Look around for free. Pay when you're ready to run your own workspaces."
                />

                <div className="mx-auto mt-14 grid max-w-5xl gap-5 lg:grid-cols-3">
                    {PLANS.map(plan => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col rounded-2xl border bg-[#15181F] p-6 ${plan.featured
                                ? 'border-[#33477A] shadow-lg shadow-[#5B8DEF]/10 lg:-translate-y-2'
                                : 'border-[#262B36]'
                                }`}
                        >
                            {plan.featured && (
                                <span className="absolute -top-3 left-6 rounded-full border border-[#33477A] bg-[#243352] px-3 py-0.5 text-[11px] font-medium text-[#A9C0FF]">
                                    Most popular
                                </span>
                            )}

                            <h3 className="text-sm font-semibold">{plan.name}</h3>
                            <p className="mt-4 flex items-baseline gap-2">
                                <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
                                <span className="text-xs text-[#868C9C]">{plan.unit}</span>
                            </p>
                            <p className="mt-3 text-[13px] text-[#868C9C]">{plan.blurb}</p>

                            <ul className="my-6 flex flex-1 flex-col gap-3 text-[13px]">
                                {plan.features.map(f => (
                                    <li key={f.text} className={`flex items-start gap-2.5 ${f.off ? 'text-[#565C6B]' : ''}`}>
                                        {f.off ? (
                                            <Minus className="mt-0.5 h-4 w-4 shrink-0 text-[#565C6B]" />
                                        ) : (
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#3DD68C]" />
                                        )}
                                        <span>{f.text}</span>
                                    </li>
                                ))}
                            </ul>

                            <ButtonLink
                                href={plan.href}
                                variant={plan.featured ? 'primary' : 'secondary'}
                                className="w-full"
                            >
                                {plan.cta}
                            </ButtonLink>
                        </div>
                    ))}
                </div>

                <p className="mt-8 text-center text-xs text-[#565C6B]">Prices in USD.</p>
            </div>
        </section>
    )
}