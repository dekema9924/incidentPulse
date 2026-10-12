import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { SendMail } from "./nodemailer";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,

    },
    session: {
        expiresIn: 60 * 60 * 24 * 1
    },

    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                if (type === "sign-in") {
                    // Send the OTP for sign in
                    // await SendMail(email, otp)
                    // console.log("sign-in otp:", otp)
                } else if (type === "email-verification") {
                    await SendMail(email, otp)
                } else {
                    // Send the OTP for password reset
                }
            },
        }),
        nextCookies()
    ]
});