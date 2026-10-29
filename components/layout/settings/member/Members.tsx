
'use client'
import Pendinginvitation from '@/components/ui/Pendinginvitation'
import AllMembers from './AllMembers'
import { useDashboardContext } from '@/context/DashboardContext'
import { useOrgModalContext } from '@/context/DashboardModals'

export default function Members() {
    const { isAdmin, org } = useDashboardContext()
    const { setInviteOpen, inviteOpen } = useOrgModalContext()

    // console.log({ "isAdmin": isAdmin, "inviteOpen": inviteOpen })
    return (
        <>
            <main className='w-11/12'>
                <div className='flex items-center justify-between '>
                    <div>
                        <h1 className='font-bold text-xl'>Members</h1>
                        <span className='secondary-text'>Who can see and work on {org.name}</span>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setInviteOpen(true)}
                            className="rounded-md cursor-pointer border border-[#33477A] bg-[#243352] px-3 py-1.5 text-[13px] font-medium hover:border-[#4A63A0]"
                        >
                            + Invite member
                        </button>
                    )}
                </div>

                {/* //pending invitations */}
                <Pendinginvitation />

                {/* all members */}
                <AllMembers />
            </main>
        </>
    )
}
