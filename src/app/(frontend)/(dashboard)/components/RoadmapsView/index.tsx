"use client";

import { Grid2x2, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import RoadmapItem from "@/components/RoadmapItem";
import Button from "@/components/ui/button";
import FilterSort from "./FilterSort";

import { ROADMAP_CATEGORIES } from "@/constants";
import { cn } from "@/lib/utils";
import { RoadmapItemsResponse } from "@/types/Responses";

const categories = ROADMAP_CATEGORIES.map((c) => ({
  value: c.value,
  label: c.label,
}));

export default function RoadmapsView({
  roadmapItems,
  params: { status, category, sortBy },
}: {
  roadmapItems: RoadmapItemsResponse[];
  params: {
    status: string;
    category: string;
    sortBy: string;
  };
}) {
  const router = useRouter();
  const [view, setView] = useState<"grid" | "list">("grid");

  const handleFilterChange = (
    variant: "status" | "category" | "sortBy",
    value: string,
  ) => {
    const newParams = new URLSearchParams(window.location.search);

    if (variant === "status") {
      newParams.set("status", value);
    } else if (variant === "category") {
      newParams.set("category", value);
    } else if (variant === "sortBy") {
      newParams.set("sortBy", value);
    }

    router.push(`?${newParams.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <FilterSort
        statusFilter={status}
        categoryFilter={category}
        sortBy={sortBy}
        categories={categories}
        onChange={handleFilterChange}
      />

      <div className="flex justify-end px-2">
        <Button
          onClick={() => setView((prev) => (prev === "grid" ? "list" : "grid"))}
          title={
            view === "grid" ? "Switch to List View" : "Switch to Grid View"
          }
        >
          {view === "grid" ? (
            <List className="size-4" />
          ) : (
            <Grid2x2 className="size-4" />
          )}
        </Button>
      </div>

      {roadmapItems.length > 0 ? (
        <div
          className={cn("grid grid-cols-1 gap-4", {
            "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4": view === "grid",
          })}
        >
          {roadmapItems.map((item) => (
            <RoadmapItem key={item.id} view={view} {...item} />
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center">
          <p className="text-center text-4xl text-gray-500">
            No roadmap items found.
          </p>
        </div>
      )}
    </div>
  );
}
