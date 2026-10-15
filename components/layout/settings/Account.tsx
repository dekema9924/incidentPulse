'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { authClient } from '@/src/lib/auth-client'

const MIN_PASSWORD = 12

const cardClass = 'mt-5 max-w-3xl rounded-xl border border-[#262B36] bg-[#15181F] p-5 text-[#E7E9EE]'
const labelClass = 'mb-1.5 block text-[11px] text-[#565C6B]'
const inputClass =
    'w-full rounded-md border border-[#262B36] bg-[#1B1F28] px-3 py-2.5 text-[13px] outline-none focus:border-[#5B8DEF] disabled:opacity-60'
const primaryBtn =
    'rounded-md border border-[#33477A] bg-[#243352] px-4 py-2.5 text-[13px] font-medium hover:border-[#4A63A0] disabled:cursor-not-allowed disabled:opacity-50'

type Message = { type: 'ok' | 'error'; text: string } | null

function PasswordField({
    id,
    label,
    value,
    onChange,
    autoComplete,
    hint,
}: {
    id: string
    label: string
    value: string
    onChange: (v: string) => void
    autoComplete: string
    hint?: string
}) {
    const [show, setShow] = useState(false)

    return (
        <div className="mb-4">
            <label htmlFor={id} className={labelClass}>{label}</label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    placeholder="••••••••"
                    className={`${inputClass} pr-10`}
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-3 text-[#565C6B] hover:text-white"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {hint && <p className="mt-1.5 text-[11px] text-[#565C6B]">{hint}</p>}
        </div>
    )
}

function Feedback({ message }: { message: Message }) {
    if (!message) return null
    return (
        <p className={`mt-3 text-xs ${message.type === 'ok' ? 'text-[#3DD68C]' : 'text-[#E5484D]'}`}>
            {message.text}
        </p>
    )
}

export default function Account() {
    const router = useRouter()

    // the component gets its own user data
    const { data: session, isPending } = authClient.useSession()
    const user = session?.user

    // ----- profile -----
    const [name, setName] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)
    const [profileMsg, setProfileMsg] = useState<Message>(null)
    const profileDirty = !!user && name.trim() !== user.name

    // fill the field once the session arrives (and again if the saved name changes)
    useEffect(() => {
        if (user?.name) setName(user.name)
    }, [user?.name])

    const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const trimmed = name.trim()
        if (!trimmed || trimmed.length > 60) {
            setProfileMsg({ type: 'error', text: 'Name must be 1 to 60 characters.' })
            return
        }

        setProfileMsg(null)
        setSavingProfile(true)
        try {
            const { error } = await authClient.updateUser({ name: trimmed })
            if (error) {
                setProfileMsg({ type: 'error', text: error.message ?? 'Could not update your name.' })
                return
            }
            setProfileMsg({ type: 'ok', text: 'Name updated.' })
            router.refresh() // re-render server components so the sidebar/header show the new name
        } catch {
            setProfileMsg({ type: 'error', text: 'Something went wrong. Please try again.' })
        } finally {
            setSavingProfile(false)
        }
    }

    // ----- password -----
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [savingPassword, setSavingPassword] = useState(false)
    const [passwordMsg, setPasswordMsg] = useState<Message>(null)

    const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMsg({ type: 'error', text: 'Please fill in all three fields.' })
            return
        }
        if (newPassword.length < MIN_PASSWORD) {
            setPasswordMsg({ type: 'error', text: `New password must be at least ${MIN_PASSWORD} characters.` })
            return
        }
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: 'error', text: 'New passwords do not match.' })
            return
        }
        if (newPassword === currentPassword) {
            setPasswordMsg({ type: 'error', text: 'New password must be different from the current one.' })
            return
        }

        setPasswordMsg(null)
        setSavingPassword(true)
        try {
            const { error } = await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: true, // signs out every other device
            })
            if (error) {
                setPasswordMsg({ type: 'error', text: error.message ?? 'Could not change your password.' })
                return
            }
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setPasswordMsg({ type: 'ok', text: 'Password changed. Your other sessions were signed out.' })
        } catch {
            setPasswordMsg({ type: 'error', text: 'Something went wrong. Please try again.' })
        } finally {
            setSavingPassword(false)
        }
    }

    return (
        <div>
            {/* ===== PROFILE ===== */}
            <form onSubmit={handleProfileSave} className={cardClass}>
                <h2 className="text-base font-semibold">Profile</h2>
                <p className="mt-1 mb-5 text-xs text-[#868C9C]">
                    Your name is visible to everyone in this workspace.
                </p>

                <div className="mb-4">
                    <label htmlFor="name" className={labelClass}>Name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={isPending}
                        maxLength={60}
                        autoComplete="name"
                        className={inputClass}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className={labelClass}>Email</label>
                    <input
                        id="email"
                        type="email"
                        value={user?.email ?? ''}
                        disabled
                        readOnly
                        className={inputClass}
                    />
                    <p className="mt-1.5 text-[11px] text-[#565C6B]">
                        Your sign-in address cannot be changed from here.
                    </p>
                </div>

                <button type="submit" disabled={!profileDirty || savingProfile} className={primaryBtn}>
                    {savingProfile ? 'Saving…' : 'Save changes'}
                </button>
                <Feedback message={profileMsg} />
            </form>

            {/* ===== PASSWORD ===== */}
            <form onSubmit={handlePasswordChange} className={cardClass}>
                <h2 className="text-base font-semibold">Password</h2>
                <p className="mt-1 mb-5 text-xs text-[#868C9C]">
                    Changing it signs out your other sessions.
                </p>

                <PasswordField
                    id="current-password"
                    label="Current password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    autoComplete="current-password"
                />
                <PasswordField
                    id="new-password"
                    label="New password"
                    value={newPassword}
                    onChange={setNewPassword}
                    autoComplete="new-password"
                    hint={`At least ${MIN_PASSWORD} characters.`}
                />
                <PasswordField
                    id="confirm-password"
                    label="Confirm new password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    autoComplete="new-password"
                />

                <button type="submit" disabled={savingPassword} className={primaryBtn}>
                    {savingPassword ? 'Changing…' : 'Change password'}
                </button>
                <Feedback message={passwordMsg} />
            </form>
        </div>
    )
}