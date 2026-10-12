'use server'

import { RedirectIfVerified } from "@/src/lib/auth-utils";
import VerifyEmail from "@/components/layout/AuthLayout/VerifyEmail";


export default async function verifyPage() {
    await RedirectIfVerified()

    return <VerifyEmail />

}
