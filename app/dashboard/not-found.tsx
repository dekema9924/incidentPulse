// app/dashboard/not-found.tsx
import Link from 'next/link'

export default function DashboardNotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
            <h1 className="text-lg font-semibold">Workspace not found</h1>
            <p className="text-sm text-[#868C9C]">
                It doesn&apos;t exist, or you don&apos;t have access to it.
            </p>
            <Link href="/dashboard" className="text-sm text-[#5B8DEF] underline">
                Back to my workspaces
            </Link>
        </div>
    )
}