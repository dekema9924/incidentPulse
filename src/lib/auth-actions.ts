'use server'
import { auth } from '@/src/lib/auth'
import { headers } from 'next/headers'
import { prisma } from './prisma'
import { hashToken } from '@/utils/invite-token'
import { claimInvitation } from './accept-invite'
import { findInvitationByToken, getValidInvitation } from '@/utils/Invitation'


type LoginType = {
    name: string
    email: string
    password: string
    callbackURL?: string
}


//create account
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
            message: "Account Created",
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




//sign in
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
            requiresVerification: false,

        };
    } catch (error: any) {
        console.error("Sign in error:", error);
        const status = error?.statusCode
        // console.log("status", status)
        // console.log("error", error)

        return {
            success: false,
            data: null,
            error: error.body?.message ?? "Something went wrong.",
            requiresVerification: status === 403,

        };
    }
};


//signout
export const SignOut = async () => {
    try {
        const res = await auth.api.signOut({
            headers: await headers()
        })

        return res
    } catch (err) {
        if (err) return {
            success: false,
            error: err,
            message: "error signing out"
        }
    }
}




//email OTP
export const SendVerificationOTP = async (
    email: string,
    type: "email-verification" | "sign-in" | "forget-password"
) => {
    try {

        await auth.api.sendVerificationOTP({
            body: {
                email,
                type,
            },
        });


        return {
            success: true,
            error: null,
        };
    } catch (error) {

        return {
            success: false,
            error: "Failed to send verification OTP",
        };
    }
};

//check verification OTP
export const VerifyOTP = async (
    email: string,
    type: "email-verification" | "sign-in" | "forget-password",
    otp: string
) => {
    try {
        const data = await auth.api.verifyEmailOTP({
            body: {
                email,
                otp,
            },
        });

        // console.log("otpdata", data)

        return {
            success: true,
            data,
            error: null,
        };
    } catch (err: any) {
        console.error(err);

        return {
            success: false,
            data: null,
            error: err,
        };
    }
};


type MemberSignUpInput = { token: string; name: string; password: string } // no email field

export const MemberSignUp = async ({ token, name, password }: MemberSignUpInput) => {
    // 1. the invitation decides org, role and email
    const invite = await getValidInvitation(token)
    if (!invite) {
        return { success: false as const, error: 'This invitation is invalid or has expired.' }
    }
    // 2. already has an account? they should sign in instead (your invite page can redirect them there)
    const existing = await prisma.user.findUnique({
        where: { email: invite.email },
        select: { id: true },
    })
    if (existing) {
        return {
            success: false as const,
            error: 'An account with this email already exists. Please sign in to accept the invitation.',
        }
    }

    try {
        // 3. create the account using the invited email
        const res = await SignUp({ name, email: invite.email, password })
        if (!res.success) {
            return { success: false as const, error: 'Could not create your account.' }
        }

        const user = await prisma.user.findUnique({
            where: { email: invite.email },
            select: { id: true },
        })
        if (!user) throw new Error('User missing after sign-up')

        // 4. optional: clicking the emailed link already proves they own this inbox,
        //    so you can skip the OTP step
        await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } })

        // 5. join the org with the role from the invitation
        await claimInvitation(user.id, invite)

        // 6. sign them in here with whatever your login helper is, then send them in
        return { success: true as const, slug: invite.organization.slug }
    } catch (e) {
        console.error('MemberSignUp failed', e)
        return { success: false as const, error: 'Something went wrong. Please try again.' }
    }
}