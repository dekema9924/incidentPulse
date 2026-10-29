'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboardContext } from '@/context/DashboardContext'
import { slugify } from '@/utils/slugify'
import Account from './Account'
import { updateOrganization } from '@/src/lib/dashboard-actions'
import Members from './member/Members'
import { getMembers } from '@/src/lib/org-access'







type Tab = 'general' | 'members' | 'account'


export default function Settings() {
    const router = useRouter()
    const { org, isAdmin } = useDashboardContext()
    const [memberCount, setMemberCount] = useState<number>(0)

    const TABS: { id: Tab; label: string }[] = [
        { id: 'general', label: 'General' },
        { id: 'members', label: `Members (${memberCount})` },
        { id: 'account', label: 'Account' },
    ]

    // console.log(org)


    const getMemberCount = async () => {
        const count = await getMembers(org.slug)
        setMemberCount(count.length)
    }

    useEffect(() => {
        getMemberCount()
    }, [org])

    const [tab, setTab] = useState<Tab>('general')
    const [name, setName] = useState(org.name)
    const [slug, setSlug] = useState(org.slug)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const dirty = name.trim() !== org.name || slug !== org.slug

    // clean loosely while typing so "acme-" doesn't lose its dash; full cleanup on blur
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))

    const handleSlugBlur = () => setSlug(slugify(slug))

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!dirty || !isAdmin) return

        const cleanSlug = slugify(slug)
        if (!name.trim() || !cleanSlug) {
            setError('Name and workspace URL are both required.')
            return
        }

        setError(null)
        setSaving(true)
        try {
            // TODO: call your update-organization server action here
            const result = await updateOrganization({ id: org.id, name: name.trim(), slug: cleanSlug })
            if (!result.success) { setError(result.error); return }

            if (result.slug !== org.slug) router.replace(`/dashboard/${result.slug}`) // old URL is dead now
            else router.refresh()
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <main>
            {/* tabs */}
            <div className="secondary-text text-xs flex gap-6 border-b border-[#262B36]">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`pb-2 -mb-px border-b-2 transition-colors ${tab === t.id
                            ? 'border-white text-white'
                            : 'border-transparent hover:text-white'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'general' && (
                <form
                    onSubmit={handleSave}
                    className="mt-5 max-w-3xl rounded-xl border border-[#262B36] bg-[#15181F] p-5 text-[#E7E9EE]"
                >
                    <h2 className="text-base font-semibold">General</h2>
                    <p className="mt-1 mb-5 text-xs text-[#868C9C]">
                        The name your team sees, and the address this workspace lives at.
                    </p>

                    <label htmlFor="ws-name" className="mb-1.5 block text-[11px] text-[#565C6B]">
                        Name
                    </label>
                    <input
                        id="ws-name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={!isAdmin}
                        maxLength={60}
                        className="mb-4 w-full rounded-md border border-[#262B36] bg-[#1B1F28] px-3 py-2.5 text-[13px] outline-none focus:border-[#5B8DEF] disabled:opacity-60"
                    />

                    <label htmlFor="ws-url" className="mb-1.5 block text-[11px] text-[#565C6B]">
                        Workspace URL
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                            id="ws-url"
                            value={slug}
                            onChange={handleSlugChange}
                            onBlur={handleSlugBlur}
                            disabled={!isAdmin}
                            className="w-full rounded-md border border-[#262B36] bg-[#1B1F28] px-3 py-2.5 text-[13px] outline-none focus:border-[#5B8DEF] disabled:opacity-60"
                        />
                        <button
                            type="submit"
                            disabled={!isAdmin || !dirty || saving}
                            className="shrink-0 rounded-md border border-[#33477A] bg-[#243352] px-4 py-2.5 text-[13px] font-medium hover:border-[#4A63A0] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>

                    <p className="mt-2 text-[11px] text-[#565C6B]">
                        Changing this breaks existing links to this workspace.
                    </p>

                    {!isAdmin && (
                        <p className="mt-3 text-xs text-[#868C9C]">
                            Only owners and admins can change workspace settings.
                        </p>
                    )}
                    {error && <p className="mt-3 text-xs text-[#E5484D]">{error}</p>}
                </form>
            )}

            {tab === 'members' && <div className="mt-5"><Members /></div>}
            {tab === 'account' && <div className="mt-5"><Account /></div>}
        </main>
    )
}