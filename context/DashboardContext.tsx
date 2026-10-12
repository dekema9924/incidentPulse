'use client'
import React, { useState, createContext, useContext, Dispatch, SetStateAction } from "react";

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
export interface Org { id: string; name: string; slug: string }

type DashboardContextType = {
    isActiveId: number
    setIsActiveId: Dispatch<SetStateAction<number>>
    org: Org
    role: Role
    isAdmin: boolean   // OWNER or ADMIN: can assign incidents, approve requests, invite
    canPost: boolean   // everyone except VIEWER: can post, acknowledge, resolve
}

const DashboardContext = createContext<DashboardContextType | undefined>(
    undefined
)

export const DashboardContextProvider = ({
    children,
    org,
    role,
}: {
    children: React.ReactNode
    org: Org
    role: Role
}) => {
    const [isActiveId, setIsActiveId] = useState<number>(1);

    const isAdmin = role === 'OWNER' || role === 'ADMIN'
    const canPost = role !== 'VIEWER'

    return (
        <DashboardContext.Provider
            value={{ isActiveId, setIsActiveId, org, role, isAdmin, canPost }}
        >
            {children}
        </DashboardContext.Provider>
    )
}

export const useDashboardContext = () => {
    const context = useContext(DashboardContext);

    if (!context) {
        throw new Error(
            "useDashboardContext must be used within DashboardContextProvider"
        );
    }

    return context;
};