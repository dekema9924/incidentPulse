import SignInPage from "@/components/layout/Signin";
import { RedirectIfVerified } from "@/src/lib/auth-utils";

export default async function SignIn() {
    await RedirectIfVerified();

    return <SignInPage />;
}