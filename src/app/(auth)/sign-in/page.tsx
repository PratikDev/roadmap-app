import Link from "next/link";

import CenterScreen from "@/components/CenterScreen";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function page() {
  return (
    <CenterScreen className="px-4 py-6">
      <div className="w-full max-w-[480px] rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-10 text-center text-3xl font-semibold">Sign in</h1>

        <form className="space-y-8">
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
            <Button>Sign in</Button>

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
