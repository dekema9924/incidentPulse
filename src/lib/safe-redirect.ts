// src/lib/safe-redirect.ts   (plain module)
export function safeCallbackUrl(raw: string | null): string | null {
    if (!raw) return null
    // same-site paths only: one leading "/", no "//" and no "/\" tricks
    if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return null
    return raw
}