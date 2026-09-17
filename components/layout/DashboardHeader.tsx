import CurrentDateWidget from '@/utils/CurrentDateWidget'
import Link from 'next/link'
import Button from '../ui/Button'

export default function DashboardHeader() {

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
                            <span className='bg-blue-600 w-6  flex items-center justify-center h-6  rounded-full text-blue-300'>D</span>
                            <span className='font-bold block'>Daniel</span>
                        </div>
                        <Button className='w-22 mx-2 h-10 text-sm font-bold' text='LogOut' />
                    </div>
                </header>
                <p className='panel text-xs secondary-text p-2'>Simulation. The escalation countdown, incoming teammate messages, and postmortem draft all run live in your browser — standing in for what WebSockets + the Claude API would do server-side. Signing in with different personas doesn't yet sync across real separate sessions (no backend behind this yet).</p>
            </div>
        </>
    )
}
