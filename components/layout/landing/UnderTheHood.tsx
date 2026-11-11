// components/landing/UnderTheHood.tsx
import { Database, KeyRound, ShieldCheck } from 'lucide-react'
import SectionHeading from './SectionHeading'

const POINTS = [
    {
        icon: Database,
        title: 'Your workspace comes from your session',
        body: 'Access is checked against your membership on the server. A name or ID in the URL is never trusted on its own, so one company can never open another\'s incidents.',
    },
    {
        icon: ShieldCheck,
        title: 'Roles are checked on every action',
        body: 'Viewers can\'t post, members can\'t assign, and the server says no even if someone skips the interface.',
    },
    {
        icon: KeyRound,
        title: 'Invite links you can\'t guess',
        body: 'Tokens are random, stored hashed, single-use, and expire after seven days.',
    },
]

export default function UnderTheHood() {
    return (
        <section className="border-t border-[#262B36]">
            <div className="mx-auto max-w-6xl px-4 py-20">
                <SectionHeading
                    eyebrow="Under the hood"
                    title="Built so one team never sees another's data"
                    description="The part of a multi-tenant product that is easy to get wrong, so here is how it works."
                />

                <ul className="mt-12 grid gap-4 md:grid-cols-3">
                    {POINTS.map(({ icon: Icon, title, body }) => (
                        <li key={title} className="rounded-xl border border-[#262B36] bg-[#15181F] p-6">
                            <Icon className="h-5 w-5 text-[#5B8DEF]" />
                            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                            <p className="mt-2 text-[13px] leading-relaxed text-[#868C9C]">{body}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}