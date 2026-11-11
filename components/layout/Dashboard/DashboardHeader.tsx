'use client'
import CurrentDateWidget from '@/utils/CurrentDateWidget'
import Link from 'next/link'
import LogOutBtn from '../../ui/LogOutBtn'
import { authClient } from '@/src/lib/auth/auth-client'
import { useDashboardContext } from '@/context/DashboardContext'
import { useOrgModalContext } from '@/context/DashboardModals'

export default function DashboardHeader() {
    const { data: session } = authClient.useSession()
    const { plan } = useDashboardContext()
    const { openPayment } = useOrgModalContext()


    return (
        <>
            <div>
                <header className='panel p-4 flex items-center justify-between gap-3'>
                    {/* left header */}
                    <div className='flex min-w-0 items-center gap-2'>
                        <div className='flex items-center gap-1 justify-center'>
                            <span className='w-3 block h-3 rounded-full bg-[#E5484D] animate-pulse'></span>
                            <p className='font-bold text-md whitespace-nowrap'>INCIDENT PULSE</p>
                        </div>
                        <span className='hidden text-sm secondary-text sm:block'>on-call console</span>
                    </div>

                    {/* right header */}
                    <div className='flex shrink-0 items-center gap-2'>
                        <span className='hidden md:block'>
                            <CurrentDateWidget />
                        </span>
                        <span className='hidden secondary-text text-xs md:block'>2 active</span>

                        <Link
                            className='panel secondary-text hover:text-white! hover:border-[#4e5564]! text-xs text-center block border px-3 py-2 rounded-lg whitespace-nowrap'
                            href={'/status'}
                        >
                            <span className='hidden lg:inline'>View public status page — no sign-in required</span>
                            <span className='lg:hidden'>Status</span>
                        </Link>

                        {/* free accounts only */}
                        {plan === 'FREE' && (
                            <button
                                type='button'
                                onClick={() => openPayment()}
                                className='shrink-0 whitespace-nowrap rounded-lg border border-[#33477A] bg-[#243352] px-3 py-2 text-xs font-medium text-white transition-colors hover:border-[#4A63A0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B8DEF]'
                            >
                                Upgrade
                            </button>
                        )}

                        <div className='secondary-text text-xs flex items-center gap-1'>
                            <span className='rounded-md w-7 h-7 p-2 flex items-center justify-center shrink-0 text-[#5b8def] bg-[#0d3179] uppercase'>
                                {session?.user.name.slice(0, 1)}
                            </span>
                        </div>
                        <LogOutBtn />
                    </div>
                </header>

                <p className='panel text-xs secondary-text p-2'>Simulation. The escalation countdown, incoming teammate messages, and postmortem draft all run live in your browser — standing in for what WebSockets + the Claude API would do server-side. Signing in with different personas doesn't yet sync across real separate sessions (no backend behind this yet).</p>
            </div>
        </>
    )
}