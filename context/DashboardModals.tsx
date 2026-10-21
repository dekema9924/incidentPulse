'use client'
import React, { useState, createContext, useContext, Dispatch, SetStateAction } from "react";

type OrgModalType = {
    newOrgOpen: boolean
    setNewOrgOpen: Dispatch<SetStateAction<boolean>>
    inviteOpen: boolean
    setInviteOpen: Dispatch<SetStateAction<boolean>>
}

const OrgModalContext = createContext<OrgModalType | undefined>(undefined)

export const OrgModalContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [newOrgOpen, setNewOrgOpen] = useState<boolean>(false)
    const [inviteOpen, setInviteOpen] = useState<boolean>(false)

    return (
        <OrgModalContext.Provider value={{ newOrgOpen, setNewOrgOpen, inviteOpen, setInviteOpen }}>
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