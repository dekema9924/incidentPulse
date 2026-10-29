import Button from '@/components/ui/Button'
import { MinusIcon, PlusIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import NewIncidentForm from './NewIncidentForm'
import { useDashboardContext } from '@/context/DashboardContext'
import { getIncidents } from '@/src/lib/incident-actions'
import { IncidentListItem } from '@/src/lib/incident-actions'


type Severity = 'P1' | 'P2' | 'P3'
type Status = 'Investigating' | 'Identified' | 'Monitoring' | 'Resolved'
type EventType = 'msg' | 'system' | 'escalation' | 'resolve'
type Role = 'Owner' | 'Admin' | 'Member' | 'Viewer'


const SEV_BAR: Record<Severity, string> = {
    P1: 'bg-[#E5484D]',
    P2: 'bg-[#F5A524]',
    P3: 'bg-[#5B8DEF]',
}

interface TimelineInterface {
    id: string
    author: string
    text: string
    time: number
    type: EventType
}

const STATUS_PILL: Record<Status, string> = {
    Investigating: 'text-[#E5484D] border-[#4a2124]',
    Identified: 'text-[#F5A524] border-[#4a3a1a]',
    Monitoring: 'text-[#5B8DEF] border-[#233a5c]',
    Resolved: 'text-[#3DD68C] border-[#1d4b3a]',
}






export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<IncidentListItem[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const selectedIncident = incidents.find((i) => i.id == selectedId)
    const [openIncidentModal, setOpenIncidentModal] = useState<boolean>(false)
    const { org } = useDashboardContext()
    const [version, setVersion] = useState(0) // bump to refetch after creating an incident


    useEffect(() => {
        let cancelled = false

        getIncidents(org.slug)
            .then(data => { if (!cancelled) setIncidents(data) })
            .catch(() => { if (!cancelled) setIncidents([]) })

        return () => { cancelled = true }
    }, [org.slug, version])

    // console.log(selectedIncident)
    const openDate = selectedIncident?.opened ? new Date(selectedIncident?.opened).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }) : ""

    return (
        <main>


            {/* incident queque */}
            <section>
                <div className='flex items-center gap-4 my-2'>
                    <span className='secondary-text text-xs'>INCDENT QUEQUE</span>
                    <p onClick={() => setOpenIncidentModal(!openIncidentModal)} className='panel cursor-pointer w-fit! h-6! flex text-xs items-center px-3 rounded-md'>{openIncidentModal ? "" : <PlusIcon className='w-4' />}{openIncidentModal ? "Cancel" : "New"}</p>
                </div>
                {
                    openIncidentModal && (
                        <NewIncidentForm
                            onCreated={id => {
                                setVersion(v => v + 1)        // the effect keyed on `version` refetches getIncidents
                                setSelectedId(id)             // open the incident you just created
                                setOpenIncidentModal(false)   // close the form
                            }}
                        />
                    )
                }

                {incidents.map(inc => (
                    <button
                        key={inc.id}
                        onClick={() => setSelectedId(inc.id)}
                        className={`flex w-full gap-3 px-4 py-3 text-left border-b border-[#262B36] hover:bg-[#15181F] ${inc.id === selectedId ? 'bg-[#1B1F28]' : ''
                            }`}
                    >
                        <span className={`w-0.75 rounded-sm shrink-0 ${SEV_BAR[inc.severity]}`} />
                        <span className="min-w-0">
                            <span className="block text-[13px] leading-snug mb-1.5">{inc.title}</span>
                            <span className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#868C9C]">
                                <span>{inc.id}</span>
                                <span className={`rounded-[3px] border px-1.5 py-px text-[10px] ${STATUS_PILL[inc.status]}`}>
                                    {inc.status}
                                </span>
                                <span>{inc.assignee ?? 'Unassigned'}</span>
                            </span>
                        </span>
                    </button>
                ))}

            </section>


            {/* gateway */}
            <section>

                <div className='flex justify-between p-6'>
                    <div className='flex flex-col gap-2'>
                        <h1 className='font-semibold  w-10/12'>{selectedIncident?.title}</h1>
                        <div className='secondary-text text-xs flex gap-2 '>
                            <span>{selectedIncident?.id}</span>
                            <span
                                className={
                                    selectedIncident?.status
                                        ? STATUS_PILL[selectedIncident.status]
                                        : ""
                                }
                            >
                                {selectedIncident?.status}
                            </span>                        <span>severity {selectedIncident?.severity}</span>

                        </div>
                        <span className='secondary-text text-xs'>Opened {openDate} </span>

                    </div>
                    <Button
                        text='Resolve'
                        className='text-white px-4 text-xs h-7 w-fit border border-[#e5484d]/10 bg-[#e5484d]/20!'
                    />
                </div>

                <hr className='panel border-t-0!' />

                {/* chat */}
                <div className="flex-1 overflow-y-auto px-5 py-4">

                </div>

            </section>

        </main>
    )
}
