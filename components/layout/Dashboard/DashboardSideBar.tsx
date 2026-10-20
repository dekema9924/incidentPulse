'use client'

import { useDashboardContext } from '@/context/DashboardContext';
import { PanelRight, PlusCircleIcon } from 'lucide-react';
import { LayoutGrid } from 'lucide-react';
import { MessageSquareWarning } from 'lucide-react';
import { Cog } from 'lucide-react';
import { CalendarDays } from 'lucide-react';
import { TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import OrgSwitcher from '../Organization/OrgSwitcher';

export default function DashboardSideBar() {

    const { isActiveId, setIsActiveId, org, isAdmin } = useDashboardContext()
    const [sideBarOpen, setSideBarOpen] = useState<boolean>(true)
    const isOwner = isAdmin ? "Admin" : "member"
    const [newOrgModalOpen, setNewOrgModal] = useState<boolean>(false)

    //set active tab to display on dashboard panel
    const handleActiveTab = (id: number) => {
        if (isActiveId != id) {
            setIsActiveId(id)
        }
    }

    // console.log(isAdmin)


    //collapse sidebar on mobiile
    const handleSideBarCollapse = () => {
        if (window.innerWidth < 768) {
            setSideBarOpen(false);
        }
    };


    return (
        <>
            <aside className={`panel ${sideBarOpen ? "w-56" : "w-18"} p-5 min-h-screen text-xs transition-all duration-150 overflow-hidden`}>
                <div className='flex items-center justify-between'>
                    {sideBarOpen && <p className='secondary-text text-xs'>WORKSPACE</p>}
                    <PanelRight onClick={() => setSideBarOpen(!sideBarOpen)} className={`secondary-text text-xs cursor-pointer hover:text-white! w-5 shrink-0 ${!sideBarOpen && "mx-auto"}`} />
                </div>

                <hr className='secondary-text w-full border-t-0 border-b my-3 ' />


                {/* //ADD ORGANIZATION */}
                <button
                    type="button"
                    onClick={() => setNewOrgModal(!newOrgModalOpen)}
                    aria-expanded={newOrgModalOpen}
                    aria-label="Switch organization"
                    title={!sideBarOpen ? org.name : undefined}
                    className={`group relative flex w-full cursor-pointer items-center gap-2 rounded-md p-1.5 text-left transition-colors hover:bg-[#1B1F28] ${sideBarOpen ? "justify-between" : "justify-center"
                        } ${newOrgModalOpen ? "bg-[#1B1F28]" : ""}`}
                >                    <div className={`flex items-center gap-2 ${!sideBarOpen && "justify-center"}`}>
                        <span className='rounded-md w-7 h-7 p-2 flex items-center justify-center shrink-0 text-[#5b8def] bg-[#0d3179]'>{org.name.slice(0, 2).toUpperCase()}</span>
                        {sideBarOpen && (
                            <div>
                                <p className='w-30'>{org.name}</p>
                                <span className='secondary-text block'>{isOwner}</span>
                            </div>
                        )}
                    </div>
                    {/* {sideBarOpen && (
                        <PlusCircleIcon onClick={() => setNewOrgModal(!newOrgModalOpen)} className='secondary-text cursor-pointer  w-5 shrink-0' />
                    )} */}

                    {
                        newOrgModalOpen && (

                            <OrgSwitcher />

                        )
                    }
                </button>


                <ul className='dashboard-list-style secondary-text mt-10 flex flex-col gap-1'>
                    {
                        [

                            {
                                id: 1,
                                label: "Dashboard",
                                icon: LayoutGrid,
                            },
                            {
                                id: 2,
                                label: "Incidents",
                                icon: MessageSquareWarning,
                            },
                            {
                                id: 3,
                                label: "My Incidents",
                                icon: TriangleAlert,
                            },
                            {
                                id: 4,
                                label: "Calendar",
                                icon: CalendarDays,
                            },
                            {
                                id: 5,
                                label: "Settings",
                                icon: Cog,
                            },

                        ].map((item) => {
                            const Icon = item.icon;
                            const isActive = isActiveId === item.id;

                            return (

                                <li
                                    onClick={() => {
                                        handleActiveTab(item.id), handleSideBarCollapse()
                                    }}
                                    key={item.id}
                                    className={`flex items-center gap-3 rounded-md px-2 py-2 cursor-pointer transition-colors
                                        ${sideBarOpen ? "" : "justify-center"}
                                        ${isActive ? "bg-[#1b1f28] text-white!" : "hover:bg-[#1b1f28] hover:text-white!"}`}
                                    title={!sideBarOpen ? item.label : undefined}
                                >
                                    <Icon className={`w-5 shrink-0 ${isActive ? "text-white!" : ""}`} />
                                    {sideBarOpen && <span>{item.label}</span>}
                                </li>

                            )
                        })
                    }
                </ul>

            </aside>


        </>
    )
}