"use client";

import { SignOut } from "@/src/lib/auth-actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LogOutBtn() {
    const router = useRouter();

    const handleSignout = async () => {
        const res = await SignOut();

        if (res && res.success) {
            router.push("/auth/sign-in");
            router.refresh();
            toast.success("Signed Out Successfully")
        } else {
            toast.error("Error signing out");
        }
    };

    return (
        <button
            className="w-16 mx-2 h-9 text-xs font-bold bg-red-500  cursor-pointer rounded-md"
            onClick={handleSignout}
        >
            Sign Out
        </button>
    );
}