import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">

            <form className='panel h-auto rounded-lg overflow-y-none w-[min(360px,92vw)] p-[clamp(20px,5vw,28px)] max-h-[min(560px,90vh)]' action="">
                <div className='flex items-center gap-1 my-6 justify-center  '>
                    <span className='w-3 block h-3 rounded-full bg-[#E5484D] animate-pulse'></span>
                    <p className='font-bold text-md'>INCIDENT PULSE</p>
                </div>

                {/* inputs
                 || email */}
                <div className='flex flex-col gap-1 mt-10'>
                    <label className=' secondary-text pl-2 text-xs ' htmlFor="email">Email</label>
                    <input className='panel h-10 rounded-md text-sm pl-2 ' type="email" name="email" id="email" placeholder='daniel@fiserv.example' />
                </div>

                {/* name */}
                <div className='flex flex-col gap-1 mt-10'>
                    <label className=' secondary-text pl-2 text-xs ' htmlFor="email">Name</label>
                    <input className='panel h-10 rounded-md text-sm pl-2 ' type="text" name="name" id="name" placeholder='John Doe' />
                </div>

                {/* password */}
                <div className='flex flex-col gap-1 mt-10'>
                    <label className=' secondary-text pl-2 text-xs ' htmlFor="password">password</label>
                    <input className='panel h-10 rounded-md text-sm pl-2 ' type="password" name="password" id="password" placeholder='***********' />
                </div>


                {/* submit btn */}
                <Button className=' w-full my-6 h-8 border border-[#32519b] text-xs ' text='SignIn' />

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
