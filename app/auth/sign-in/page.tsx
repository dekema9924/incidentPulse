import SignInPage from "@/components/layout/AuthLayout/Signin";
import HomeBtn from "@/components/ui/HomeBtn";
import { RedirectIfVerified } from "@/src/lib/auth/auth-utils";

export default async function SignIn() {
    // await RedirectIfVerified();



    return (
        <>
            <HomeBtn />
            <SignInPage />;
        </>
    )
}