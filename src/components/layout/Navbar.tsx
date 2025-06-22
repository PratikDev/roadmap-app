"use client";

import { Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import Button from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const rr = await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/sign-in");
            toast.success("Logged out successfully!");
          },
        },
      });
      if (rr.error) {
        throw new Error(rr.error.message);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-tertiary sticky top-0 left-0 z-50 flex items-center justify-between px-6 py-4 shadow-md">
      <Link
        href="/"
        className="text-dark text-2xl font-bold transition-opacity hover:opacity-80"
      >
        RoadmapApp
      </Link>

      <Button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="border border-red-500 bg-red-100 p-2 text-red-500"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4" />
        )}
      </Button>
    </nav>
  );
}
