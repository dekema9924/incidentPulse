// components/layout/AuthLayout/SwitchAccountButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/src/lib/auth-client'

export default function SwitchAccountButton() {
    const router = useRouter()

    const handleClick = async () => {
        await authClient.signOut()
        router.refresh() // re-runs the server page, which now sees no session
    }

    return (
        <button
            onClick={handleClick}
            className="panel mt-4 h-8 w-full cursor-pointer rounded-md border border-[#32519b] text-xs font-semibold hover:bg-[#646a7a]"
        >
            Sign out and continue
        </button>
    )
}