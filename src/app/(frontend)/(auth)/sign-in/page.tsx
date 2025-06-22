"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import CenterScreen from "@/components/CenterScreen";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

import { authClient } from "@/lib/auth-client";

export default function page() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    /* TODO: Add schema validation */

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => setIsLoading(true),
        onSuccess: () => {
          setIsLoading(false);
          toast.success("Sign in successful! Redirecting...");
          router.push("/");
        },
        onError: (ctx) => {
          setIsLoading(false);
          console.error("Sign in error:", ctx.error);
          toast.error(ctx.error.message || "Sign in failed. Please try again.");
        },
      },
    );
  };

  return (
    <CenterScreen className="px-4 py-6">
      <div className="w-full max-w-[480px] rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-10 text-center text-3xl font-semibold">Sign in</h1>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>

            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter password"
            />
          </div>

          <div className="space-y-6">
            <Button type="submit" disabled={isLoading} className="w-full">
              Sign in
              {isLoading && <Loader2 className="ml-2 size-4 animate-spin" />}
            </Button>

            <p className="text-center text-sm">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="text-secondary ml-1 font-semibold whitespace-nowrap hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </CenterScreen>
  );
}
