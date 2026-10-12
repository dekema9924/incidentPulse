import Button from '@/components/ui/Button'
import { PlusIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'



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



interface IncidentInterface {
    id: string
    title: string
    severity: Severity
    status: Status
    opened: number
    acked: boolean
    escalated: boolean
    escalateSecondsLeft: number
    assignee: string | null
    requests: string[]
    timeline: TimelineInterface[]
}


const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`


const buildSeed = (): IncidentInterface[] => {
    const now = Date.now()
    return [
        {
            id: 'INC-2041',
            title: 'Payment gateway returning 502s for EU region',
            severity: 'P1',
            status: 'Investigating',
            opened: now - 4 * 60000,
            acked: false,
            escalated: false,
            escalateSecondsLeft: 60,
            assignee: null,
            requests: [],
            timeline: [
                { id: uid(), author: 'PagerDuty', time: now - 4 * 60000, type: 'system', text: 'Alert fired: error rate >5% on payments-eu-gateway.' },
                { id: uid(), author: 'Priya R.', time: now - 3 * 60000, type: 'msg', text: 'On it, pulling gateway logs now.' },
            ],
        },
        {
            id: 'INC-2042',
            title: 'Elevated latency on account balance API',
            severity: 'P2',
            status: 'Identified',
            opened: now - 18 * 60000,
            acked: true,
            escalated: false,
            escalateSecondsLeft: 0,
            assignee: 'Marcus T.',
            requests: [],
            timeline: [
                { id: uid(), author: 'Datadog', time: now - 18 * 60000, type: 'system', text: 'Alert fired: p95 latency 3x baseline on /accounts/balance.' },
                { id: uid(), author: 'Marcus T.', time: now - 15 * 60000, type: 'msg', text: 'Acknowledged. Looks like connection pool exhaustion.' },
            ],
        },
        {
            id: 'INC-2038',
            title: 'Nightly batch reconciliation job failed',
            severity: 'P3',
            status: 'Resolved',
            opened: now - 3 * 3600000,
            acked: true,
            escalated: false,
            escalateSecondsLeft: 0,
            assignee: 'Elena K.',
            requests: [],
            timeline: [
                { id: uid(), author: 'Cron Monitor', time: now - 3 * 3600000, type: 'system', text: 'Job recon-nightly exited with code 1.' },
                { id: uid(), author: 'Elena K.', time: now - 2 * 3600000, type: 'resolve', text: 'Job completed on manual rerun. Resolving.' },
            ],
        },
    ]
}



export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<IncidentInterface[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const selectedIncident = incidents.find((i) => i.id == selectedId)

    useEffect(() => {
        const seed = buildSeed()
        setIncidents(seed)
        setSelectedId(seed[0].id)
    }, [])

    console.log(selectedIncident)
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
                    <p className='panel cursor-pointer w-fit! flex text-xs items-center px-3 rounded-md'><PlusIcon className='w-4' />New</p>
                </div>

                {incidents.map(inc => (
                    <button
                        key={inc.id}
                        onClick={() => setSelectedId(inc.id)}
                        className={`flex w-full gap-3 px-4 py-3 text-left border-b border-[#262B36] hover:bg-[#15181F] ${inc.id === selectedId ? 'bg-[#1B1F28]' : ''
                            }`}
                    >
                        <span className={`w-[3px] rounded-sm shrink-0 ${SEV_BAR[inc.severity]}`} />
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
