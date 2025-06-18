import React from "react";

import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"button"> & {
  children: React.ReactNode;
};
export default function Button({ className, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={cn(
        "bg-primary hover:bg-secondary flex w-full items-center justify-center transition-colors disabled:cursor-auto disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
