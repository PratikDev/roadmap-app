"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export default function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  const handleBack = () => {
    router.back();
  };
  return (
    <button
      onClick={handleBack}
      className={cn("group flex items-center gap-2 px-0", className)}
    >
      <ArrowLeft className="size-4" />
      <span className="sr-only">Go Back</span>
      <span className="group-hover:underline">Back</span>
    </button>
  );
}
