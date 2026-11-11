// components/landing/LandingNav.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Brand from './Brand'
import ButtonLink from './ButtonLink'
import { NAV_LINKS, ROUTES } from './constants'

export default function LandingNav() {
    const [open, setOpen] = useState(false)

    return (
        <header className="sticky top-0 z-40 border-b border-[#262B36] bg-[#0E1015]/80 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                <Brand />

                <nav aria-label="Main" className="hidden items-center gap-6 text-sm text-[#868C9C] md:flex">
                    {NAV_LINKS.map(l => (
                        <Link key={l.href} href={l.href} className="transition-colors hover:text-white">
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <ButtonLink href={ROUTES.signIn} variant="ghost" size="sm">Sign in</ButtonLink>
                    <ButtonLink href={ROUTES.signUp} size="sm">Start free</ButtonLink>
                </div>

                <button
                    type="button"
                    onClick={() => setOpen(v => !v)}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                    className="rounded-md p-2 text-[#868C9C] hover:text-white md:hidden"
                >
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {open && (
                <div className="border-t border-[#262B36] bg-[#0E1015] px-4 py-4 md:hidden">
                    <nav aria-label="Mobile" className="flex flex-col gap-1 text-sm">
                        {NAV_LINKS.map(l => (
                            <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className="rounded-md px-2 py-2 text-[#868C9C] hover:bg-[#15181F] hover:text-white"
                            >
                                {l.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-3 flex gap-2">
                        <ButtonLink href={ROUTES.signIn} variant="secondary" size="sm" className="flex-1">Sign in</ButtonLink>
                        <ButtonLink href={ROUTES.signUp} size="sm" className="flex-1">Start free</ButtonLink>
                    </div>
                </div>
            )}
        </header>
    )
}