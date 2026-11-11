// components/landing/Hero.tsx
import ButtonLink from './ButtonLink'
import ProductPreview from './ProductPreview'
import { ROUTES } from './constants'

export default function Hero() {
    return (
        <section className="relative overflow-hidden">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(91,141,239,0.18),transparent)]"
            />

            <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:pt-24">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#262B36] bg-[#15181F] px-3 py-1 text-xs text-[#868C9C]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E5484D]" />
                    Real-time incident response
                </span>

                <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                    When something breaks, your team already knows{' '}
                    <span className="text-[#5B8DEF]">who owns it</span>
                </h1>

                <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#868C9C] sm:text-lg">
                    Open an incident, hand it to the right person, and let escalation cover the gap when nobody
                    answers. One timeline per incident, one workspace per team.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <ButtonLink href={ROUTES.signUp}>Start for free</ButtonLink>
                    <ButtonLink href="#how-it-works" variant="secondary">See how it works</ButtonLink>
                </div>
                <p className="mt-4 text-xs text-[#565C6B]">Free to look around. No credit card.</p>

                <div className="mx-auto mt-14 max-w-5xl">
                    <ProductPreview />
                </div>
            </div>
        </section>
    )
}