'use client'

import NewOrgModal from './NewOrgModal'
import InviteMemberModal from '../settings/member/InviteMemberModal'
import { useOrgModalContext } from '@/context/DashboardModals'
import PaymentModal from '../payment/PaymentModal'

export default function RenderModals() {
    const { newOrgOpen, setNewOrgOpen, inviteOpen, setInviteOpen, paymentPlan, closePayment } = useOrgModalContext()

    return (
        <>
            {newOrgOpen && <NewOrgModal onClose={() => setNewOrgOpen(false)} />}
            {inviteOpen && <InviteMemberModal onClose={() => setInviteOpen(false)} />}
            {paymentPlan && <PaymentModal initialPlan={paymentPlan} onClose={closePayment} />}
        </>
    )
}