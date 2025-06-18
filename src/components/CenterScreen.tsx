import { cn } from "@/lib/utils";

type CenterScreenProps = {
  className?: string;
  children: React.ReactNode;
};
export default function CenterScreen({
  className,
  children,
}: CenterScreenProps) {
  return (
    <div
      className={cn("flex min-h-screen items-center justify-center", className)}
    >
      {children}
    </div>
  );
}
