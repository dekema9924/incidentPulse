
'use client'
import AllMembers from './AllMembers'
import { useDashboardContext } from '@/context/DashboardContext'
import { useOrgModalContext } from '@/context/DashboardModals'

export default function Members() {
    const { isAdmin } = useDashboardContext()
    const { setInviteOpen, inviteOpen } = useOrgModalContext()

    // console.log({ "isAdmin": isAdmin, "inviteOpen": inviteOpen })
    return (
        <>
            <main className='w-11/12'>
                <div className='flex items-center justify-between '>
                    <div>
                        <h1 className='font-bold text-xl'>Members</h1>
                        <span className='secondary-text'>Who can see and work on Northwind studio</span>
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
                <div className='panel my-5 rounded-md p-3 text-xs'>
                    <span className='secondary-text '>PENDING INVITATIONS(1)</span>
                    <div className='flex items-center justify-between my-2'>
                        <div>
                            <p>newresponder@northwind.demo</p>
                            <span className='secondary-text'>invited by You . role Member . expiresIn 7 days</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <button className='panel cursor-pointer hover:bg-[#646a7a] border rounded-md w-fit px-2 h-8 text-small font-semibold'>View email</button>
                            <button className='panel cursor-pointer hover:bg-[#646a7a] rounded-md w-fit px-2 h-8 text-small font-semibold'>Revoke</button>
                        </div>
                    </div>
                </div>

                {/* all members */}
                <AllMembers />
            </main>
        </>
    )
}
