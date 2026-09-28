'use client'

import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'
import Link from 'next/link'
import { useForm, SubmitHandler } from "react-hook-form"
import PasswordInput from '@/components/ui/Passwordinput'
import { SignUp } from '@/src/lib/auth-actions'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { SendVerificationOTP } from '@/src/lib/auth-actions'



type formDataType = {
    name: string
    email: string
    password: string
}

export default function SignUpPage() {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<formDataType>()
    const onSubmit: SubmitHandler<formDataType> = async (data) => {
        const res = await SignUp(data)
        if (!res.success) {
            toast.error(res.error);
            return;
        }
        if (res.message && res.success) {
            toast.success(res.message);

            if (!res.data.user.emailVerified) {
                const otpRes = await SendVerificationOTP(
                    data.email,
                    "email-verification"
                );

                if (!otpRes.success) {
                    toast.error(otpRes.error);
                    return;
                }

                router.push(
                    `/auth/verify?email=${encodeURIComponent(data.email)}`
                );
            }
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center">

            <form onSubmit={handleSubmit(onSubmit)} className='panel h-auto rounded-lg overflow-y-none w-[min(360px,92vw)] p-[clamp(20px,5vw,28px)] max-h-[min(560px,90vh)]' action="">
                <Logo />

                {/* inputs
                 || email */}
                <div className='flex flex-col gap-1 mt-10'>
                    <label className=' secondary-text pl-2 text-xs ' htmlFor="email">Email</label>
                    <input
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Please enter a valid email address",
                            },
                        })}
                        className='panel h-10 rounded-md text-sm pl-2 ' type="email" name="email" id="email" placeholder='daniel@fiserv.example' />
                    {errors.email && <span className=' error_message text-sm'>{errors.email.message}</span>}
                </div>

                {/* name */}
                <div className='flex flex-col gap-1 mt-10'>
                    <label className=' secondary-text pl-2 text-xs ' htmlFor="email">Name</label>
                    <input
                        {...register("name", {
                            required: "Name is required",
                            maxLength: { value: 30, message: "Name is too Long" }
                        })}
                        className='panel h-10 rounded-md text-sm pl-2 ' type="text" name="name" id="name" placeholder='John Doe' />
                    {errors.name && <span className='error_message text-xs '>{errors.name.message}</span>}

                </div>

                {/* password */}
                <div className='flex flex-col gap-1 mt-10 '>
                    <PasswordInput register={register} />
                    {errors.password && <span className='error_message text-xs '>{errors.password.message}</span>}

                </div>



                {/* submit btn */}
                <Button className=' w-full my-6 h-8 border border-[#32519b] text-xs ' text='SignUp' />

                <p className='secondary-text text-xs text-center my-2'>Already have an account? <Link className='text-blue-400/70' href={'/auth/sign-in'}>Sign-In Now</Link></p>

                <div className='secondary-text flex items-center justify-evenly'>
                    <hr className='border-t w-full panel' />
                    <span className='block mx-1.5 text-sm'>OR</span>
                    <hr className='border-t w-full panel' />
                </div>

                <Link className='panel secondary-text hover:text-white! hover:border-[#4e5564]! text-xs text-center block border p-2 rounded-lg' href={'/status'}>View public status page — no sign-in required</Link>
            </form>
        </div>

    )
}
