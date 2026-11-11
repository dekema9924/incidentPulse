'use client'
import React, { useState, useCallback, createContext, useContext, Dispatch, SetStateAction } from "react";
import { PaidPlan } from "@/components/layout/payment/PaymentModal";




type OrgModalType = {
    newOrgOpen: boolean
    setNewOrgOpen: Dispatch<SetStateAction<boolean>>
    inviteOpen: boolean
    setInviteOpen: Dispatch<SetStateAction<boolean>>
    invitesVersion: number      // goes up by 1 whenever the pending-invites list should refetch
    refreshInvites: () => void
    paymentPlan: PaidPlan | null
    openPayment: (plan?: PaidPlan) => void
    closePayment: () => void
}

const OrgModalContext = createContext<OrgModalType | undefined>(undefined)

export const OrgModalContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [newOrgOpen, setNewOrgOpen] = useState<boolean>(false)
    const [inviteOpen, setInviteOpen] = useState<boolean>(false)
    const [invitesVersion, setInvitesVersion] = useState<number>(0)

    const refreshInvites = useCallback(() => {
        setInvitesVersion(v => v + 1)
    }, [])

    const [paymentPlan, setPaymentPlan] = useState<PaidPlan | null>(null)
    const openPayment = useCallback((plan: PaidPlan = 'TEAM') => setPaymentPlan(plan), [])
    const closePayment = useCallback(() => setPaymentPlan(null), [])

    return (
        <OrgModalContext.Provider
            value={{
                newOrgOpen,
                setNewOrgOpen,
                inviteOpen,
                setInviteOpen,
                invitesVersion,
                refreshInvites,
                openPayment,
                closePayment,
                paymentPlan

            }}
        >
            {children}
        </OrgModalContext.Provider>
    )
}

export const useOrgModalContext = () => {
    const context = useContext(OrgModalContext);

    if (!context) {
        throw new Error(
            "useOrgModalContext must be used within OrgModalContextProvider"
        );
    }

    return context;
};