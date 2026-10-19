

import Button from '@/components/ui/Button'
import AllMembers from './AllMembers'

export default function Members() {
    return (
        <>
            <main className='w-11/12'>
                <div className='flex items-center justify-between '>
                    <div>
                        <h1 className='font-bold text-xl'>Members</h1>
                        <span className='secondary-text'>Who can see and work on Northwind studio</span>
                    </div>
                    <Button text='+ Invite member' className='text-sm p-1 px-3' />
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
