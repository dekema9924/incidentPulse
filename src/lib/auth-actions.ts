'use server'
import { auth } from '@/src/lib/auth'
import { headers } from 'next/headers'


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

        console.log("otpdata", data)

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