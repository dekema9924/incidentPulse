"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { UseFormRegister } from "react-hook-form";

type PasswordInputProps = {
    register: UseFormRegister<any>;
};

export default function PasswordInput({
    register,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex flex-col gap-1">
            <label className=' secondary-text pl-2 text-xs ' htmlFor="password">Password</label>

            <div className="flex items-center relative">
                <input
                    {...register("password")}
                    className="panel h-10 rounded-md text-sm pl-2 w-full"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="***********"
                />

                {showPassword ? (
                    <EyeOff
                        onClick={() => setShowPassword(false)}
                        className="absolute right-5 cursor-pointer text-gray-500 hover:text-white transition-all"
                    />
                ) : (
                    <Eye
                        onClick={() => setShowPassword(true)}
                        className="absolute right-5 cursor-pointer text-gray-500 hover:text-white transition-all"
                    />
                )}
            </div>
        </div>
    );
}