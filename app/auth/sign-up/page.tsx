import { RedirectIfVerified } from "@/src/lib/auth/auth-utils";
import SignUpPage from "@/components/layout/AuthLayout/Signup";
import HomeBtn from "@/components/ui/HomeBtn";

export default async function SignIn() {
    // await RedirectIfVerified();

    return (
        <>
            <HomeBtn />
            <SignUpPage />
        </>
    );
}