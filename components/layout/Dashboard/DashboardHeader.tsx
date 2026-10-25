'use client'
import CurrentDateWidget from '@/utils/CurrentDateWidget'
import Link from 'next/link'
import LogOutBtn from '../../ui/LogOutBtn'
import { authClient } from '@/src/lib/auth-client'


export default function DashboardHeader() {
    const { data: sesison } = authClient.useSession()

    return (
        <>
            <div>
                <header className='panel p-4 flex items-center justify-between'>
                    {/* left header */}
                    <div className='flex  items-center gap-2'>
                        {/* <Logo /> */}
                        <div className='flex items-center gap-1 justify-center  '>
                            <span className='w-3 block h-3 rounded-full bg-[#E5484D] animate-pulse'></span>
                            <p className='font-bold text-md'>INCIDENT PULSE</p>
                        </div>
                        <span className='text-sm secondary-text block'>on-call console</span>
                    </div>

                    {/* right header */}
                    <div className='flex items-center gap-1'>
                        <CurrentDateWidget />
                        <span className='block secondary-text text-xs'>2 active</span>
                        <Link className='panel px-4 secondary-text hover:text-white! hover:border-[#4e5564]! text-xs text-center block border p-2 rounded-lg' href={'/status'}>View public status page — no sign-in required</Link>
                        <div className=' secondary-text text-xs flex items-center gap-1'>
                            <span className='rounded-md w-7 h-7 p-2 flex items-center justify-center shrink-0 text-[#5b8def] bg-[#0d3179] uppercase'>{sesison?.user.name.slice(0, 1)}</span>
                        </div>
                        <LogOutBtn />
                    </div>
                </header>
                <p className='panel text-xs secondary-text p-2'>Simulation. The escalation countdown, incoming teammate messages, and postmortem draft all run live in your browser — standing in for what WebSockets + the Claude API would do server-side. Signing in with different personas doesn't yet sync across real separate sessions (no backend behind this yet).</p>
            </div>
        </>
    )
}
