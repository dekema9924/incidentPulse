'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { slugify } from '@/utils/slugify'
import { createAdditionalOrganization } from '@/src/lib/dashboard-actions'

const labelClass = 'mb-1.5 block text-[11px] text-[#565C6B]'
const inputClass =
    'mb-4 w-full rounded-md border border-[#262B36] bg-[#1B1F28] px-3 py-2.5 text-[13px] text-[#E7E9EE] outline-none placeholder:text-[#565C6B] focus:border-[#5B8DEF]'

export default function NewOrgModal({ onClose }: { onClose: () => void }) {
    const router = useRouter()

    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [slugEdited, setSlugEdited] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Escape closes the modal, and the page behind it stops scrolling while it's open
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !loading) onClose()
        }
        document.addEventListener('keydown', onKey)

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = previousOverflow
        }
    }, [onClose, loading])

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setName(value)
        if (!slugEdited) setSlug(slugify(value))
    }

    // clean loosely while typing so "sales-" keeps its dash; full cleanup on blur
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
        setSlug(value)
        setSlugEdited(value !== '')
    }

    const handleSlugBlur = () => setSlug(slugify(slug))

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!name.trim()) {
            setError('Organization name is required.')
            return
        }

        setError(null)
        setLoading(true)
        try {
            const finalSlug = slugify(slug) || slugify(name)



            // TODO: call your create-additional-organization server action here
            const result = await createAdditionalOrganization({ name: name.trim(), slug: finalSlug })
            if (!result.success) {
                setError(result.error)
                return
            }
            onClose()
            router.push(`/dashboard/${result.slug}`)
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            // mouse-down (not click) so dragging a text selection out of an input doesn't close it
            onMouseDown={e => {
                if (e.target === e.currentTarget && !loading) onClose()
            }}
        >
            <form
                onSubmit={handleSubmit}
                role="dialog"
                aria-modal="true"
                aria-labelledby="new-org-title"
                className="w-full max-w-md rounded-xl border border-[#262B36] bg-[#15181F] p-6 text-[#E7E9EE] shadow-2xl"
            >
                <h2 id="new-org-title" className="text-base font-semibold">
                    New organization
                </h2>
                <p className="mt-1 mb-5 text-xs leading-relaxed text-[#868C9C]">
                    A separate workspace with its own members and incidents — e.g. one per department.
                </p>

                <label htmlFor="new-org-name" className={labelClass}>
                    Organization name
                </label>
                <input
                    id="new-org-name"
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Sales Org"
                    maxLength={60}
                    autoComplete="off"
                    autoFocus
                    className={inputClass}
                />

                <label htmlFor="new-org-slug" className={labelClass}>
                    Workspace URL (optional)
                </label>
                <input
                    id="new-org-slug"
                    type="text"
                    value={slug}
                    onChange={handleSlugChange}
                    onBlur={handleSlugBlur}
                    placeholder="e.g. sales-org"
                    autoComplete="off"
                    className={inputClass}
                />

                {error && <p className="-mt-1 mb-3 text-xs text-[#E5484D]">{error}</p>}

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-md border border-[#262B36] bg-[#1B1F28] px-4 py-2 text-[13px] hover:border-[#3a4152] disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md border border-[#33477A] bg-[#243352] px-4 py-2 text-[13px] font-medium hover:border-[#4A63A0] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Creating…' : 'Create organization'}
                    </button>
                </div>
            </form>
        </div>,
        document.body
    )
}