"use client";

import { formatDistance } from "date-fns";
import { ArrowUp, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import Button from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { RoadmapItemsResponse } from "@/types/Responses";

const getStatusColor = (status: RoadmapItemsResponse["status"]) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Planned":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "Archived":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function RoadmapItem(
  item: RoadmapItemsResponse & {
    view?: "list" | "grid";
    detailPage?: boolean;
    className?: string;
  },
) {
  const [isUpvoted, setIsUpvoted] = useState(item.hasUpvoted || false);
  const [expanded, setExpanded] = useState(item.detailPage || false);

  const DescriptionSlot = item.view === "grid" && !item.detailPage ? Link : "p";
  const TitleSlot = item.detailPage ? "div" : Link;

  const handleUpvote = async () => {
    setIsUpvoted((prev) => !prev);

    try {
      const response = await fetch(`/api/upvote/${item.id}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isUpvoted ? "upvote" : "remove upvote"} post`,
        );
      }
    } catch (error) {
      console.error("Error upvoting:", error);
      setIsUpvoted((prev) => !prev); // Revert the upvote state on error
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-y-4 rounded-lg border border-gray-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md",
        item.className,
      )}
    >
      <div className="flex flex-col items-start justify-between">
        <div
          className={cn("flex w-full items-center gap-3", {
            "items-start justify-between": item.view === "grid",
          })}
        >
          <TitleSlot
            href={`/roadmap/${item.id}`}
            className={cn({
              "hover:underline": !item.detailPage,
            })}
            title={item.title}
          >
            <h3 className="text-dark line-clamp-2 text-xl font-semibold">
              {item.title}
            </h3>
          </TitleSlot>

          <div
            className={cn("flex items-end gap-2", {
              "flex-col": item.view === "grid",
            })}
          >
            {item.category && (
              <span className="bg-tertiary text-dark inline-block rounded-md px-2 py-1 text-xs">
                {item.category}
              </span>
            )}

            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium text-nowrap capitalize",
                getStatusColor(item.status),
              )}
            >
              {item.status.replace("_", " ")}
            </span>
          </div>
        </div>

        {item.createdAt && (
          <small className="text-gray-500">
            {formatDistance(item.createdAt, new Date(), { addSuffix: true })}
          </small>
        )}
      </div>

      <DescriptionSlot
        href={`/roadmap/${item.id}`}
        className={cn("grow text-gray-600", {
          "line-clamp-none": expanded,
          "line-clamp-3": !expanded,
          "cursor-pointer": !item.detailPage,
        })}
        onClick={
          item.view === "grid" ? undefined : () => setExpanded((prev) => !prev)
        }
      >
        {item.description}
      </DescriptionSlot>

      <div className="flex items-center gap-4 text-sm *:gap-1">
        <Button
          onClick={handleUpvote}
          className={cn("bg-gray-100 px-3 py-2 text-gray-600", {
            "bg-secondary text-dark": isUpvoted,
            "hover:bg-tertiary hover:text-dark": !isUpvoted,
          })}
        >
          <ArrowUp className={cn("size-4", { "fill-current": isUpvoted })} />
          <span className="font-medium">
            {item.upvotes +
              (isUpvoted === item.hasUpvoted ? 0 : isUpvoted ? 1 : -1)}
          </span>
        </Button>

        <Link
          href={`/roadmap/${item.id}`}
          className="hover:bg-tertiary hover:text-dark flex items-center rounded-md bg-gray-100 px-3 py-2 font-medium text-gray-600 transition-colors"
        >
          <MessageCircle className="size-4" />
          <span>{item.commentsCount}</span>
        </Link>
      </div>
    </div>
  );
}
