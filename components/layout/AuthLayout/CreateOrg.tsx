'use client'

import { createOrganization } from '@/src/lib/dashboard-actions'
import React, { useState } from 'react'
import { slugify } from '@/utils/slugify'
import { useRouter } from 'next/navigation'


function CreateOrg() {
    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [slugEdited, setSlugEdited] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setName(value)
        if (!slugEdited) setSlug(slugify(value))
    }

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = slugify(e.target.value)
        setSlug(value)
        setSlugEdited(value !== '')
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!name.trim()) {
            setError('Organization name is required.')
            return
        }
        setError(null)
        setLoading(true)
        try {
            const result = await createOrganization({
                name: name.trim(),
                slug: slugify(slug) || slugify(name),
            })

            if (!result.success) {
                setError(result.error) // TypeScript knows .error exists on this branch
                setLoading(false)
                return
            }

            router.replace(`/dashboard/${result.slug}`)
        } catch {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0E1015] p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm rounded-xl border border-[#262B36] bg-[#15181F] p-7 text-[#E7E9EE]"
            >
                {/* brand */}
                <div className="flex items-center justify-center gap-2.5 mb-5">
                    <span className="w-2 h-2 rounded-full bg-[#E5484D]" />
                    <b className="text-sm tracking-wide">INCIDENTPULSE</b>
                </div>

                <p className="mb-6 text-center text-[13px] leading-relaxed text-[#868C9C]">
                    Create your organization — this becomes your first workspace, and you&apos;ll be its Owner.
                </p>

                {/* organization name */}
                <label htmlFor="org-name" className="mb-1.5 block text-[11px] text-[#565C6B]">
                    Organization name
                </label>
                <input
                    id="org-name"
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Acme IT"
                    autoComplete="organization"
                    autoFocus
                    className="mb-4 w-full rounded-md border border-[#262B36] bg-[#1B1F28] px-3 py-2.5 text-[13px] outline-none placeholder:text-[#565C6B] focus:border-[#5B8DEF]"
                />

                {/* workspace url */}
                <label htmlFor="org-slug" className="mb-1.5 block text-[11px] text-[#565C6B]">
                    Workspace URL (optional)
                </label>
                <input
                    id="org-slug"
                    type="text"
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="e.g. acme-it"
                    className="mb-4 w-full rounded-md border border-[#262B36] bg-[#1B1F28] px-3 py-2.5 text-[13px] outline-none placeholder:text-[#565C6B] focus:border-[#5B8DEF]"
                />

                {error && <p className="mb-3 text-xs text-[#E5484D]">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md border border-[#33477A] bg-[#243352] py-2.5 text-[13px] font-medium hover:border-[#4A63A0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'Creating…' : 'Create organization'}
                </button>
            </form>
        </div>
    )
}

export default CreateOrg