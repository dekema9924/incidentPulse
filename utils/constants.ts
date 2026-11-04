// 15min the escaltes to tier2
export const ESCALATION_SLA_MS = 10 * 1000



export const formatTime = (ts: number) =>
    new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })