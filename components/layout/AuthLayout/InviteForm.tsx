'use client'

import { useForm, SubmitHandler } from 'react-hook-form'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import PasswordInput from '@/components/ui/Passwordinput'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { MemberSignUp, SignIn } from '@/src/lib/auth-actions'

type InviteFormData = {
    name: string
    password: string //the server reads emailfrom the invitation
}

type Props = {
    token: string
    email: string
    orgName: string
    role: string
}

const ROLE_LABEL: Record<string, string> = {
    ADMIN: 'Admin',
    MEMBER: 'Member',
    VIEWER: 'Viewer',
}

export default function InviteForm({ token, email, orgName, role }: Props) {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<InviteFormData>({
        defaultValues: { name: '', password: '' },
    })

    const onSubmit: SubmitHandler<InviteFormData> = async (data) => {
        try {
            const res = await MemberSignUp({ token, name: data.name, password: data.password })

            if (!res.success) {
                toast.error(res.error)
                return
            }

            const signindata = {
                email,
                password: data.password
            }
            await SignIn(signindata)
            toast.success(`Welcome to ${orgName}!`)
            router.replace(`/dashboard/${res.slug}`)
        } catch {
            toast.error('Failed to accept invitation.')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0e0f14] px-4 py-6">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="panel h-auto rounded-lg w-[min(360px,92vw)] p-[clamp(20px,5vw,28px)]"
            >
                <Logo />

                <p className="text-sm text-center mt-4 mb-5">
                    You&apos;ve been invited to join{' '}
                    <span className="font-semibold text-white">{orgName}</span>{' '}
                    as <span className="font-semibold text-white">{ROLE_LABEL[role] ?? role}</span>
                </p>

                {/* Full name */}
                <div className="flex flex-col gap-1 mt-3">
                    <label className="secondary-text pl-0 text-xs" htmlFor="name">
                        Full name
                    </label>
                    <input
                        {...register('name', {
                            required: 'Full name is required',
                            maxLength: { value: 30, message: 'Name is too long' },
                            minLength: { value: 2, message: 'Name is too short' },
                        })}
                        className="panel h-8 rounded-md text-xs px-2"
                        type="text"
                        id="name"
                        placeholder="Your name"
                        autoComplete="name"
                    />
                    {errors.name && (
                        <span className="error_message text-xs">{errors.name.message}</span>
                    )}
                </div>

                {/* Email: locked to the invited address */}
                <div className="flex flex-col gap-1 mt-3">
                    <label className="secondary-text pl-0 text-xs" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="panel h-8 rounded-md text-xs px-2 opacity-70 cursor-not-allowed"
                        type="email"
                        id="email"
                        value={email}
                        readOnly
                        aria-readonly="true"
                    />
                    <span className="secondary-text text-[10px]">
                        This invitation was sent to this address.
                    </span>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1 mt-3">
                    <label className="secondary-text pl-0 text-xs" htmlFor="password">
                        Create password
                    </label>
                    <PasswordInput register={register} />
                    {errors.password && (
                        <span className="error_message text-xs">{errors.password.message}</span>
                    )}
                </div>

                <Button
                    className="w-full mt-3 mb-2 h-8 border border-[#32519b] text-xs"
                    text={isSubmitting ? 'Accepting invitation...' : 'Accept invite & join workspace'}
                />
            </form>
        </div>
    )
}