"use client";

import { formatDistance } from "date-fns";
import { ArrowUp, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import Button from "@/components/ui/button";

import { type RoadmapItem } from "@/db/schemas/roadmap-schema";
import { cn } from "@/lib/utils";

const getStatusColor = (status: RoadmapItem["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "in_progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "planned":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "archived":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function RoadmapItem(item: RoadmapItem) {
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleUpvote = () => {
    setIsUpvoted(!isUpvoted);
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/roadmap/${item.id}`} className="hover:underline">
            <h3 className="text-dark text-xl font-semibold">{item.title}</h3>
          </Link>

          {item.category && (
            <span className="bg-tertiary text-dark inline-block rounded-md px-2 py-1 text-xs">
              {item.category}
            </span>
          )}

          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium capitalize",
              getStatusColor(item.status),
            )}
          >
            {item.status.replace("_", " ")}
          </span>
        </div>

        {item.createdAt && (
          <small className="text-gray-500">
            {formatDistance(item.createdAt, new Date(), { addSuffix: true })}
          </small>
        )}
      </div>

      <p
        className={cn("cursor-pointer text-gray-600", {
          "line-clamp-3": !expanded,
          "line-clamp-none": expanded,
        })}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        {item.description}
      </p>

      <div className="flex items-center gap-4 text-sm *:gap-1">
        <Button
          onClick={handleUpvote}
          className={cn("w-auto bg-gray-100 px-3 py-2 text-gray-600", {
            "bg-secondary text-dark": isUpvoted,
            "hover:bg-tertiary hover:text-dark": !isUpvoted,
          })}
        >
          <ArrowUp className={cn("size-4", { "fill-current": isUpvoted })} />
          <span className="font-medium">
            {item.upvotes + (isUpvoted ? 1 : 0)}
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
