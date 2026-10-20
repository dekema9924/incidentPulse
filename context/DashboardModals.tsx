
'use client'
import React, { useState, createContext, useContext, Dispatch, SetStateAction } from "react";



type newOrgModalType = {
    newOrgOpen: boolean
    setNewOrgOpen: Dispatch<SetStateAction<boolean>>
}


const newOrgModalContext = createContext<newOrgModalType | undefined>(undefined)


export const OrgModalContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [newOrgOpen, setNewOrgOpen] = useState<boolean>(false)



    return (
        <newOrgModalContext.Provider value={{ newOrgOpen, setNewOrgOpen }}>
            {children}
        </newOrgModalContext.Provider>
    )

}


export const useOrgModalContext = () => {
    const context = useContext(newOrgModalContext);

    if (!context) {
        throw new Error(
            "useOrgModalContext must be used within DashboardContextProvider"
        );
    }

    return context;
};