type StatCardProps = {
    label: string
    value: number | null          // null = still loading
    hint?: string
    tone?: 'default' | 'danger' | 'success'
}

const TONE: Record<NonNullable<StatCardProps['tone']>, string> = {
    default: 'text-[#E7E9EE]',
    danger: 'text-[#E5484D]',
    success: 'text-[#3DD68C]',
}

export default function StatCard({ label, value, hint, tone = 'default' }: StatCardProps) {
    return (
        <div className="rounded-xl border border-[#262B36] bg-[#15181F] p-4">
            <p className="text-xs text-[#868C9C]">{label}</p>

            {value === null ? (
                <div className="mt-2 h-8 w-12 animate-pulse rounded bg-[#1B1F28]" />
            ) : (
                <p className={`mt-1 text-3xl font-semibold tabular-nums ${TONE[tone]}`}>{value}</p>
            )}

            {hint && <p className="mt-1 text-[11px] text-[#565C6B]">{hint}</p>}
        </div>
    )
}