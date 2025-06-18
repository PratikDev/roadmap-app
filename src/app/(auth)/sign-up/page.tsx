import Link from "next/link";

import CenterScreen from "@/components/CenterScreen";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

export default function page() {
  return (
    <CenterScreen className="px-4 py-6">
      <div className="w-full max-w-[480px] rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-10 text-center text-3xl font-semibold">Sign Up</h1>

        <form className="space-y-8">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Name
            </label>

            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Enter name"
            />
          </div>

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

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-medium"
            >
              Confirm Password
            </label>

            <Input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              placeholder="Confirm password"
            />
          </div>

          <div className="space-y-6">
            <Button>Sign up</Button>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-secondary ml-1 font-semibold whitespace-nowrap hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </CenterScreen>
  );
}
