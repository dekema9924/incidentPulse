'use server'
import { auth } from '@/src/lib/auth'
import { headers } from 'next/headers'


type LoginType = {
    name: string
    email: string
    password: string
    callbackURL?: string
}

export const SignUp = async ({ name, email, password, }: LoginType) => {
    try {
        const data = await auth.api.signUpEmail({
            body: {
                name,
                email,
                password,
                callbackURL: `${process.env.BETTER_AUTH_URL}/auth/sign-in`,
            },
        });

        return {
            success: true,
            data,
            error: null,
        };
    } catch (error: any) {
        console.error("Sign up error:", error);

        return {
            success: false,
            data: null,
            error: error.body?.message ?? "Something went wrong.",
            code: error.body?.code ?? null,
        };
    }
};



type SignInType = Omit<LoginType, "name">;
export const SignIn = async ({ email, password, }: SignInType) => {
    try {
        const data = await auth.api.signInEmail({
            body: {
                email,
                password,
                rememberMe: true
                // callbackURL: `${process.env.BETTER_AUTH_URL}/auth/sign-in`,
            },

            headers: await headers()
        });

        return {
            success: true,
            data,
            error: null,
        };
    } catch (error: any) {
        console.error("Sign in error:", error);

        return {
            success: false,
            data: null,
            error: error.body?.message ?? "Something went wrong.",
            code: error.body?.code ?? null,
        };
    }
};