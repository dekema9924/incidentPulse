// components/landing/Features.tsx
import { Activity, BellRing, Building2, CalendarDays, Mail, ShieldCheck, TriangleAlert, UserCheck } from 'lucide-react'
import SectionHeading from './SectionHeading'

const FEATURES = [
    { icon: Activity, title: 'Live incident timeline', body: 'Every update, acknowledgement and escalation lands in one ordered thread per incident.' },
    { icon: TriangleAlert, title: 'Severity that means something', body: 'P1, P2 and P3 drive the queue order, the colors and the escalation rules.' },
    { icon: BellRing, title: 'Escalation that never sleeps', body: 'A critical incident nobody acknowledges is escalated to your owners and admins, even if nobody has the page open.' },
    { icon: UserCheck, title: 'Assign or request', body: 'Admins assign incidents. Members can ask to take one, and an admin approves.' },
    { icon: ShieldCheck, title: 'Roles enforced on the server', body: 'Owner, admin, member and viewer are checked on every action, not just hidden in the interface.' },
    { icon: Building2, title: 'A workspace per team', body: 'Keep IT, Sales and Support apart, each with its own members and incidents.' },
    { icon: Mail, title: 'Invites that expire', body: 'Email invitations with single-use links. Existing users accept or decline from their inbox.' },
    { icon: CalendarDays, title: 'Calendar view', body: 'See what broke on which day, and spot the patterns.' },
]

export default function Features() {
    return (
        <section id="features" className="scroll-mt-20 border-t border-[#262B36]">
            <div className="mx-auto max-w-6xl px-4 py-20">
                <SectionHeading
                    eyebrow="What you get"
                    title="Everything an on-call team needs, and nothing it doesn't"
                    description="Built for the minutes after something breaks, not for a feature matrix."
                />

                <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {FEATURES.map(({ icon: Icon, title, body }) => (
                        <li
                            key={title}
                            className="rounded-xl border border-[#262B36] bg-[#15181F] p-5 transition-colors hover:border-[#33477A]"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#243352] text-[#A9C0FF]">
                                <Icon className="h-4 w-4" />
                            </span>
                            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-[#868C9C]">{body}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}