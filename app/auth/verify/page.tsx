'use server'

import { IsUserVerified } from "@/src/lib/auth-utils";
import VerifyEmail from "@/components/layout/VerifyEmail";


export default async function verifyPage() {
    await IsUserVerified()

    return <VerifyEmail />

}
