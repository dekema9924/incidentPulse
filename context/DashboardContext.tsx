
'use client'
import React, { useState, createContext, useContext, Dispatch, SetStateAction } from "react";


type DashboardContextType = {
    isActiveId: number
    setIsActiveId: Dispatch<SetStateAction<number>>
}


const DashboardContext = createContext<DashboardContextType | undefined>(
    undefined
)


export const DashboardContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [isActiveId, setIsActiveId] = useState<number>(1);

    return (

        <DashboardContext.Provider
            value={{ isActiveId, setIsActiveId }}
        >
            {children}
        </DashboardContext.Provider >

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