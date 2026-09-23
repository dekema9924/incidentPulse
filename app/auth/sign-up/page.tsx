import { RedirectIfVerified } from "@/src/lib/auth-utils";
import SignUpPage from "@/components/layout/Signup";

export default async function SignIn() {
    await RedirectIfVerified();

    return <SignUpPage />;
}