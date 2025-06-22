import { MAX_COMMENT_LENGTH, MIN_COMMENT_LENGTH } from "@/constants";
import { z } from "zod/v4";

export const CommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(
      MIN_COMMENT_LENGTH,
      `Comment must be at least ${MIN_COMMENT_LENGTH} characters long`,
    )
    .max(
      MAX_COMMENT_LENGTH,
      `Comment must be at most ${MAX_COMMENT_LENGTH} characters long`,
    ),
  parentCommentId: z.string().optional(),
});
