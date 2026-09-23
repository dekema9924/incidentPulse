'use server'

import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";



//check if user email is verified
export const IsUserVerified = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (session?.user.emailVerified) {
        redirect('/dashboard')
    }


};


//check if user authenticated
export const RequireAuth = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect('/auth/sign-in')
    }

    return session

}



//redirect verified users only
export async function RedirectIfVerified() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user.emailVerified) {
        redirect("/dashboard");
    }
}


