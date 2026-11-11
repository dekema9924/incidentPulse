// components/landing/ProductPreview.tsx
const QUEUE = [
    { code: 'INC-2041', title: 'Payment gateway returning 502s', dot: 'bg-[#E5484D]', status: 'Investigating', pill: 'text-[#E5484D] border-[#4a2124]', active: true },
    { code: 'INC-2042', title: 'Elevated latency on balance API', dot: 'bg-[#F5A524]', status: 'Identified', pill: 'text-[#F5A524] border-[#4a3a1a]', active: false },
    { code: 'INC-2038', title: 'Nightly reconciliation failed', dot: 'bg-[#5B8DEF]', status: 'Resolved', pill: 'text-[#3DD68C] border-[#1d4b3a]', active: false },
]

const EVENTS = [
    { who: 'PagerDuty', time: '09:14', text: 'Alert fired: error rate above 5% on payments-eu-gateway.', tone: 'text-[#F5A524]', box: '' },
    { who: 'System', time: '09:29', text: 'Escalation triggered: no acknowledgment within SLA. Paged Tier 2.', tone: 'text-[#E5484D]', box: 'rounded-md border border-[#4a2124] bg-[#E5484D]/10 px-3 py-2' },
    { who: 'Marcus T.', time: '09:31', text: 'Acknowledged. Rolling back the 14:02 config push.', tone: 'text-[#E7E9EE]', box: '' },
    { who: 'Priya R.', time: '09:34', text: 'Error rate is dropping. Holding on mitigation.', tone: 'text-[#E7E9EE]', box: '' },
]

export default function ProductPreview() {
    return (
        <div
            aria-hidden="true"
            className="overflow-hidden rounded-xl border border-[#262B36] bg-[#15181F] text-left shadow-2xl shadow-black/40"
        >
            {/* window bar */}
            <div className="flex items-center gap-1.5 border-b border-[#262B36] px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E5484D]/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#F5A524]/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#3DD68C]/60" />
                <span className="ml-3 text-[11px] text-[#565C6B]">Northwind Studio · Incidents</span>
            </div>

            <div className="grid md:grid-cols-[16rem_1fr]">
                {/* queue */}
                <ul className="hidden border-r border-[#262B36] md:block">
                    {QUEUE.map(q => (
                        <li
                            key={q.code}
                            className={`flex gap-3 border-b border-[#262B36] px-4 py-3 ${q.active ? 'bg-[#1B1F28]' : ''}`}
                        >
                            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${q.dot}`} />
                            <span className="min-w-0">
                                <span className="block truncate text-[13px] font-medium">{q.title}</span>
                                <span className="mt-1.5 flex items-center gap-2 text-[11px] text-[#868C9C]">
                                    <span className="font-mono">{q.code}</span>
                                    <span className={`rounded-full border px-2 py-px text-[10px] ${q.pill}`}>{q.status}</span>
                                </span>
                            </span>
                        </li>
                    ))}
                </ul>

                {/* timeline */}
                <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono text-[#868C9C]">INC-2041</span>
                        <span className="rounded-md border border-[#E5484D]/30 bg-[#E5484D]/15 px-1.5 py-px font-mono text-[10px] font-semibold text-[#E5484D]">P1</span>
                    </div>
                    <p className="mt-2 text-base font-semibold">Payment gateway returning 502s for EU region</p>

                    <ol className="mt-5 space-y-4">
                        {EVENTS.map(e => (
                            <li key={e.time} className="flex gap-3">
                                <span className="w-10 shrink-0 pt-0.5 font-mono text-[11px] text-[#565C6B]">{e.time}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium">{e.who}</p>
                                    <div className={`mt-1 ${e.box}`}>
                                        <p className={`text-[13px] leading-relaxed ${e.tone}`}>{e.text}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    )
}