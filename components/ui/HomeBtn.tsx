import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'


export default function HomeBtn() {
    return (
        <>
            <Link className='flex gap-1  p-3' href={'/'}><ArrowLeft /> Home</Link>
        </>
    )
}
