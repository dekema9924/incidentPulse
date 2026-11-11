// components/landing/Footer.tsx
import Link from 'next/link'
import Brand from './Brand'
import { NAV_LINKS, ROUTES } from './constants'

const linkClass = 'text-[#868C9C] transition-colors hover:text-white'

export default function Footer() {
    return (
        <footer className="border-t border-[#262B36]">
            <div className="mx-auto max-w-6xl px-4 py-12">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                        <Brand />
                        <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[#868C9C]">
                            Real-time incident response for teams that need to know who owns what.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-[#E7E9EE]">Product</h3>
                        <ul className="mt-3 space-y-2 text-[13px]">
                            {NAV_LINKS.map(l => (
                                <li key={l.href}>
                                    <Link href={l.href} className={linkClass}>{l.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-[#E7E9EE]">Account</h3>
                        <ul className="mt-3 space-y-2 text-[13px]">
                            <li><Link href={ROUTES.signIn} className={linkClass}>Sign in</Link></li>
                            <li><Link href={ROUTES.signUp} className={linkClass}>Create account</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-2 border-t border-[#262B36] pt-6 text-xs text-[#565C6B] sm:flex-row sm:justify-between">
                    <p>© {new Date().getFullYear()} IncidentPulse</p>
                    <p>Built with Next.js, Prisma, PostgreSQL, and Better Auth.</p>
                </div>
            </div>
        </footer>
    )
}