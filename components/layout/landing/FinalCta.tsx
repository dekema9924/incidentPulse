// components/landing/FinalCta.tsx
import ButtonLink from './ButtonLink'
import { ROUTES } from './constants'

export default function FinalCta() {
    return (
        <section className="border-t border-[#262B36]">
            <div className="mx-auto max-w-4xl px-4 py-20">
                <div className="rounded-2xl border border-[#262B36] bg-[#15181F] bg-[radial-gradient(80%_100%_at_50%_0%,rgba(91,141,239,0.15),transparent)] px-6 py-14 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Know who owns the next incident before it happens
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#868C9C] sm:text-base">
                        Start with the free plan to look around, or set up your first workspace in a few minutes.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <ButtonLink href={ROUTES.signUp}>Start free</ButtonLink>
                        <ButtonLink href="#pricing" variant="secondary">See pricing</ButtonLink>
                    </div>
                </div>
            </div>
        </section>
    )
}