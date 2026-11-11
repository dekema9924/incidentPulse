// components/landing/constants.ts
export const ROUTES = {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
} as const

export const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
] as const