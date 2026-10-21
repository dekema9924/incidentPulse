'use client'

import NewOrgModal from './NewOrgModal'
import InviteMemberModal from '../settings/member/InviteMemberModal'
import { useOrgModalContext } from '@/context/DashboardModals'

export default function RenderModals() {
    const { newOrgOpen, setNewOrgOpen, inviteOpen, setInviteOpen } = useOrgModalContext()

    return (
        <>
            {newOrgOpen && <NewOrgModal onClose={() => setNewOrgOpen(false)} />}
            {inviteOpen && <InviteMemberModal onClose={() => setInviteOpen(false)} />}
        </>
    )
}