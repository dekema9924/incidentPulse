// components/landing/Brand.tsx
import Link from 'next/link'

export default function Brand() {
    return (
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-wide">
            <span className="h-2 w-2 rounded-full bg-[#E5484D]" />
            INCIDENTPULSE
        </Link>
    )
}