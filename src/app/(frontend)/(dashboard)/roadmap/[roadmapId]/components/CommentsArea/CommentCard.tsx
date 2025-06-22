"use client";

import { formatDistance } from "date-fns";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/button";
import CommentsArea from "./";

import { COMMENT_MAX_DEPTH } from "@/constants";
import { CommentsResponse } from "@/types/Responses";

export default function CommentCard(comment: CommentsResponse) {
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const fetchReplies = async () => {
    // If already expanded, collapse the replies
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);
    setLoadingReplies(true);
    try {
      const response = await fetch(
        `/api/comment/${comment.roadmapItemId}?parentCommentId=${comment.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch replies");
      }
      const data = await response.json();
      setReplies(data);
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setLoadingReplies(false);
    }
  };

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center gap-x-1">
        <strong className="text-sm">{comment.user.name}</strong>
        {comment.createdAt && (
          <span className="flex items-center text-xs text-gray-500">
            •{" "}
            {formatDistance(comment.createdAt, new Date(), {
              addSuffix: true,
            })}
          </span>
        )}
      </div>

      <p className="indent-1 text-gray-800">{comment.content}</p>

      {comment.depth < COMMENT_MAX_DEPTH - 1 && (
        <Button
          onClick={fetchReplies}
          disabled={loadingReplies}
          className="hover:bg-tertiary hover:text-dark bg-gray-100 px-2.5 py-1.5 text-gray-600"
        >
          <MessageCircle className="size-3.5" />
          <span>{comment.repliesCount}</span>
        </Button>
      )}

      {expanded &&
        (loadingReplies ? (
          <span className="text-xs text-gray-400">Loading replies...</span>
        ) : (
          <CommentsArea
            depth={comment.depth + 1}
            threads={replies}
            parentCommentId={comment.id}
            roadmapItemId={comment.roadmapItemId}
          />
        ))}
    </div>
  );
}
