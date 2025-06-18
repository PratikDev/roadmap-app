import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"input">;
export default function Input({ className, ...rest }: Props) {
  return (
    <input
      {...rest}
      className={cn("w-full rounded-md border px-4 py-3 text-sm", className)}
    />
  );
}
