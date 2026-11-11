// components/landing/ButtonLink.tsx
import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
    href: string
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md'
    className?: string
    onClick?: () => void
}

const VARIANT = {
    primary: 'border-[#33477A] bg-[#243352] text-white hover:border-[#4A63A0] hover:bg-[#2a3d63]',
    secondary: 'border-[#262B36] bg-[#15181F] text-[#E7E9EE] hover:border-[#3a4152]',
    ghost: 'border-transparent text-[#868C9C] hover:text-white',
}

const SIZE = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-5 text-sm',
}

export default function ButtonLink({ href, children, variant = 'primary', size = 'md', className = '', onClick }: Props) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`inline-flex items-center justify-center rounded-md border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8DEF] ${VARIANT[variant]} ${SIZE[size]} ${className}`}
        >
            {children}
        </Link>
    )
}