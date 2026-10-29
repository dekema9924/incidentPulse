"use client";

import { SendVerificationOTP, VerifyOTP } from "@/src/lib/auth-actions";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 50;



export default function VerifyEmail() {
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const searchparams = useSearchParams()
    const email = searchparams.get("email")
    const router = useRouter()
    const [isSubmit, setIsSubmit] = useState<boolean>(false)



    useEffect(() => {
        if (secondsLeft <= 0) return;
        const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [secondsLeft]);

    function handleChange(index: number, value: string) {
        if (!/^[0-9]?$/.test(value)) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    }

    async function handleResend() {
        if (secondsLeft > 0) return;
        setSecondsLeft(RESEND_SECONDS);
        // call resend-OTP endpoint here
        if (email) {
            const resend = await SendVerificationOTP(email, "email-verification")
            if (resend.success) {
                toast.success("OTP Sent")
            }
        }
    }

    async function handleVerify() {
        setIsSubmit(true)

        const code = otp.join("");

        if (!email) return;

        const verify = await VerifyOTP(
            email,
            "email-verification",
            code
        );


        if (!verify.success) {
            toast.error(verify.error?.message ?? "Invalid verification code");
            setIsSubmit(false)
            return;
        }
        toast.success("Email verified!");
        router.push("/dashboard");
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#0E1015] p-4">
            <div className="relative w-[min(400px,92vw)] rounded-xl border border-[#262B36] bg-[#15181F] p-6 sm:p-9 text-center">
                <button
                    aria-label="Close"
                    className="absolute top-3.5 right-3.5 text-[#565C6B] hover:text-[#E7E9EE] text-lg"
                >
                    ×
                </button>

                <div className="flex justify-center mb-4">
                    <svg viewBox="0 0 64 64" width={52} height={52} fill="none">
                        <rect x="6" y="20" width="52" height="34" rx="6" fill="#1B1F28" stroke="#33477a" strokeWidth="2" />
                        <path d="M6 24 L32 42 L58 24" stroke="#5B8DEF" strokeWidth="2" fill="none" />
                        <circle cx="20" cy="16" r="8" fill="#E5484D" />
                        <rect x="17" y="22" width="6" height="10" rx="2" fill="#E5484D" />
                    </svg>
                </div>

                <h1 className="text-[19px] text-[#E7E9EE] mb-2.5 font-semibold">
                    Verify Your Email Address
                </h1>
                <p className="text-[13px] text-[#868C9C] leading-relaxed mb-6">
                    We sent an email to your email address. Enter the 5-digit OTP code here.
                </p>

                <div className="flex justify-center gap-2.5 mb-5">
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => { inputsRef.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            className="w-11.5 h-13 text-center text-lg font-mono text-[#E7E9EE] bg-[#1B1F28] border border-[#262B36] rounded-lg outline-none focus:border-[#5B8DEF] focus:ring-2 focus:ring-[#5B8DEF]/15"
                        />
                    ))}
                </div>

                <div className="text-[12.5px] text-[#868C9C] mb-5">
                    Want to change your email address?{" "}
                    <a href="#" className="text-[#5B8DEF] underline">
                        Change here
                    </a>
                </div>

                <button
                    disabled={isSubmit}
                    onClick={handleVerify}
                    className={`${isSubmit ? "bg-gray-500" : "bg-[#243352]  cursor-pointer "} w-full py-3 mb-3.5 rounded-lg  border border-[#33477A] text-[#E7E9EE] text-sm font-semibold hover:border-[#4A63A0]`}
                >
                    {isSubmit ? <LoaderCircle className="mx-auto animate-spin" /> : "Verify Email"}
                </button>

                <button
                    onClick={handleResend}
                    disabled={secondsLeft > 0}
                    className={`text-[12.5px] ${secondsLeft > 0
                        ? "text-[#565C6B] cursor-default"
                        : "text-[#5B8DEF] underline cursor-pointer"
                        }`}
                >
                    {secondsLeft > 0
                        ? `Resend code in 0:${String(secondsLeft).padStart(2, "0")}`
                        : "Resend code"}
                </button>
            </div>
        </main>
    );
}