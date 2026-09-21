'use server'

import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

export const IsUserVerified = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    console.log('sesison', session)


    if (!session) {
        return false;
    }

    return session.user.emailVerified;
};

