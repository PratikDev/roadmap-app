import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export default function Pagination({
  totalPages,
  currentPage,
  className,
}: {
  totalPages: number;
  currentPage: number;
  className?: string;
}) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
    >
      <ul className="flex items-center gap-1">
        {!isFirstPage && (
          <li>
            <PaginationLink
              href={`?page=${currentPage - 1}`}
              aria-disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
              <span>Previous</span>
            </PaginationLink>
          </li>
        )}

        {Array.from({ length: totalPages }, (_, i) => (
          <li key={i}>
            <PaginationLink
              href={`?page=${i + 1}`}
              isActive={currentPage === i + 1}
            >
              {i + 1}
            </PaginationLink>
          </li>
        ))}

        {!isLastPage && (
          <li>
            <PaginationLink
              href={`?page=${currentPage + 1}`}
              aria-disabled={currentPage === totalPages}
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </PaginationLink>
          </li>
        )}
      </ul>
    </nav>
  );
}

type PaginationLinkProps = React.ComponentProps<typeof Link> & {
  children?: React.ReactNode;
  isActive?: boolean;
};
const PaginationLink = ({
  children,
  className,
  isActive = false,
  ...props
}: PaginationLinkProps) => {
  return (
    <Link
      {...props}
      className={cn(
        "text flex items-center gap-1 rounded-md px-3 py-1 font-medium transition-colors",
        className,
        {
          "border border-slate-400 bg-slate-100 font-bold text-slate-800":
            isActive,
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900": !isActive,
        },
      )}
    >
      {children}
    </Link>
  );
};
