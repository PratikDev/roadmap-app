"use client";

import { formatDistance } from "date-fns";
import { MessageCircle, Pen, SendHorizonal, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import toast from "react-hot-toast";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import CommentsArea from "./";

import { COMMENT_MAX_DEPTH } from "@/constants";
import { authClient } from "@/lib/auth-client";
import { CommentSchema } from "@/schemas/CommentSchema";
import { CommentsResponse } from "@/types/Responses";

export default function CommentCard(
  comment: CommentsResponse & { onRemove: (commentId: string) => void },
) {
  const { isPending, data: session } = authClient.useSession();
  const isCommentOwner = isPending
    ? false
    : session?.user?.id === comment.user.id;

  const renderId = useId();

  const [content, setContent] = useState(comment.content);
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [editing, setEditing] = useState(false);

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

  const handleEdit = async (e: React.FormEvent) => {
    if (!isCommentOwner) {
      toast.error("You can only edit your own comments.");
      return;
    }

    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const input = form.elements.namedItem(
      `thread-input-${renderId}`,
    ) as HTMLInputElement;

    const schemaResponse = CommentSchema.omit({
      parentCommentId: true,
    }).safeParse({
      content: input.value,
    });
    if (!schemaResponse.success) {
      const errorMessage = schemaResponse.error.issues[0].message;
      toast.error(errorMessage);
      return;
    }

    try {
      setContent(input.value); // Optimistically update the comment content
      setEditing(false);

      const response = await fetch(`/api/comment/${comment.roadmapItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: schemaResponse.data.content,
          id: comment.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to edit comment");
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      setContent(comment.content); // Revert to original content on error
      toast.error("Failed to edit comment. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!isCommentOwner) {
      toast.error("You can only delete your own comments.");
      return;
    }

    try {
      const response = await fetch(`/api/comment/${comment.roadmapItemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: comment.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      toast.success("Comment deleted successfully");
      comment.onRemove(comment.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment. Please try again.");
    }
  };

  return (
    <div className="group relative space-y-2 rounded-lg p-4 transition-colors hover:bg-gray-50">
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

      {editing ? (
        <form
          className="relative flex items-center space-x-2"
          onSubmit={handleEdit}
        >
          <Input
            name={`thread-input-${renderId}`}
            id={`thread-input-${renderId}`}
            defaultValue={content}
            placeholder="Edit your comment..."
            className="rounded-full pr-12"
          />

          <div className="absolute right-2 h-full p-1">
            <Button type="submit" className="h-full rounded-full px-3 py-1.5">
              <SendHorizonal className="size-4" />
            </Button>
          </div>
        </form>
      ) : (
        <p className="indent-1 text-gray-800">{content}</p>
      )}

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

      {/* Edit and Delete button */}
      {isCommentOwner && (
        <div className="absolute top-0 right-0 m-2 hidden items-center gap-x-1 group-hover:flex">
          <Button
            type="button"
            className="bg-transparent p-2 text-gray-500 hover:bg-gray-200"
            onClick={() => setEditing((prev) => !prev)}
          >
            <Pen className="size-3" />
            <span className="sr-only">Edit Comment</span>
          </Button>

          <Button
            type="button"
            className="bg-transparent p-2 text-red-500 hover:bg-red-200"
            onClick={handleDelete}
          >
            <Trash2 className="size-3" />
            <span className="sr-only">Delete Comment</span>
          </Button>
        </div>
      )}

      {expanded &&
        (loadingReplies ? (
          <span className="text-xs text-gray-400">Loading replies...</span>
        ) : (
          <CommentsArea
            depth={comment.depth + 1}
            className="rounded-md"
            threads={replies}
            parentCommentId={comment.id}
            roadmapItemId={comment.roadmapItemId}
          />
        ))}
    </div>
  );
}
