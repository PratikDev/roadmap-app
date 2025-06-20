"use client";

import { Grid2x2, List } from "lucide-react";
import { useState } from "react";

import RoadmapItem from "@/components/RoadmapItem";
import Button from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { RoadmapItemsResponse } from "@/types/Responses";

export default function RoadmapsView({
  roadmapItems,
}: {
  roadmapItems: RoadmapItemsResponse[];
}) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end px-2">
        <Button
          onClick={() => setView((prev) => (prev === "grid" ? "list" : "grid"))}
          className="w-auto"
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

      <div
        className={cn("grid grid-cols-4 gap-4", {
          "grid-cols-1": view === "list",
        })}
      >
        {roadmapItems.map((item) => (
          <RoadmapItem key={item.id} view={view} {...item} />
        ))}
      </div>
    </div>
  );
}
