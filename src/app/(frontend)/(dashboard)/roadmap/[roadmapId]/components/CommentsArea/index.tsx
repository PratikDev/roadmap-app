"use client";

import { SendHorizonal } from "lucide-react";
import { useId, useState } from "react";
import toast from "react-hot-toast";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import CommentCard from "./CommentCard";

import { COMMENT_MAX_DEPTH } from "@/constants";
import { cn } from "@/lib/utils";
import { CommentSchema } from "@/schemas/CommentSchema";
import { CommentsResponse } from "@/types/Responses";

type Props = {
  threads: CommentsResponse[];
  roadmapItemId: string;
  depth: number;
  parentCommentId?: string;
  className?: string;
};
export default function CommentsArea({
  threads,
  roadmapItemId,
  depth,
  parentCommentId,
  className,
}: Props) {
  const renderId = useId();
  const [threadsList, setThreadsList] = useState<CommentsResponse[]>(threads);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const threadInput = form.elements.namedItem(
      `thread-input-${renderId}`,
    ) as HTMLInputElement;

    const schemaResponse = CommentSchema.safeParse({
      content: threadInput.value,
      parentCommentId,
    });
    if (!schemaResponse.success) {
      const errorMessage = schemaResponse.error.issues[0].message;
      toast.error(errorMessage);
      return;
    }

    try {
      // Optimistically update the comments list
      setThreadsList((prev) => [
        {
          id: crypto.randomUUID(),
          content: threadInput.value,
          createdAt: new Date(),
          depth: depth + 1, // Increment depth for replies
          parentCommentId: parentCommentId || null,
          roadmapItemId,
          updatedAt: new Date(),
          repliesCount: 0,
          replies: [],
          user: {
            id: crypto.randomUUID(), // Placeholder for user ID
            name: "You", // Placeholder for user name
            email: "random",
            createdAt: new Date(),
            updatedAt: new Date(),
            emailVerified: false,
          },
        },
        ...prev,
      ]);

      const response = await fetch(`/api/comment/${roadmapItemId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: schemaResponse.data.content,
          parentId: schemaResponse.data.parentCommentId || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit comment`);
      }
    } catch (error) {
      // Rollback optimistic update if there's an error
      setThreadsList((prev) => prev.slice(1));

      console.error("Error commenting:", error);
      toast.error("Failed to submit comment. Please try again.");
    } finally {
      form.reset();
    }
  };

  const handleRemove = (commentId: string) => {
    setThreadsList((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-y-2 bg-white p-3",
        {
          "pl-4": depth === 1,
          "pl-8": depth === 2,
        },
        className,
      )}
    >
      {depth < COMMENT_MAX_DEPTH && (
        <form
          className={cn("relative flex items-center space-x-2", {
            "order-1": depth > 0,
          })}
          onSubmit={handleSubmit}
        >
          <Input
            name={`thread-input-${renderId}`}
            id={`thread-input-${renderId}`}
            placeholder={depth === 0 ? "Add a comment..." : "Reply..."}
            className="rounded-full pr-12"
          />

          <div className="absolute right-2 h-full p-1">
            <Button type="submit" className="h-full rounded-full px-3 py-1.5">
              <SendHorizonal className="size-4" />
            </Button>
          </div>
        </form>
      )}

      {threadsList.length > 0 ? (
        <div className="space-y-2">
          {threadsList.map((comment) => (
            <CommentCard
              key={comment.id}
              {...comment}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : depth === 0 ? (
        <p className="text-gray-500">No comments yet.</p>
      ) : null}
    </div>
  );
}
