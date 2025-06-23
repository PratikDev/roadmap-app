import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod/v4";

import {
  COMMENT_MAX_DEPTH,
  MAX_POST_PER_PAGE,
  ROADMAP_CATEGORIES,
  ROADMAP_STATUSES,
} from "@/constants";
import { auth } from "@/lib/auth";
import { CommentSchema } from "@/schemas/CommentSchema";
import {
  CommentsResponse,
  RoadmapItemDetailResponse,
  RoadmapItemsResponse,
} from "@/types/Responses";
import db, {
  Comments,
  comments,
  RoadmapItem,
  roadmapItems,
  upvotes,
  user,
} from "../";

class RoadmapsAPI {
  private normalizeCategoryName(category: RoadmapItem["category"]) {
    return (
      ROADMAP_CATEGORIES.find((c) => c.value === category)?.label ||
      "Unknown Category"
    );
  }

  private normalizeStatusName(status: RoadmapItem["status"]) {
    return (
      ROADMAP_STATUSES.find((s) => s.value === status)?.label ||
      "Unknown Status"
    );
  }

  private SORT_MAP = {
    newest: desc(roadmapItems.createdAt),
    oldest: asc(roadmapItems.createdAt),
    most_upvoted: desc(roadmapItems.upvotes),
    least_upvoted: asc(roadmapItems.upvotes),
  };

  async get(roadmapId: string): Promise<RoadmapItemDetailResponse | undefined> {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // Fetch the roadmap item
    const item = await db.query.roadmapItems.findFirst({
      where: (r, { eq }) => eq(r.id, roadmapId),
    });
    if (!item) {
      return undefined;
    }

    // Check if user has upvoted
    const userUpvote = await db.query.upvotes.findFirst({
      where: (u, { and, eq }) =>
        and(eq(u.userId, userId), eq(u.roadmapItemId, roadmapId)),
    });

    // Fetch top-level comments (no replies)
    const commentsData = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        depth: comments.depth,
        repliesCount: comments.repliesCount,
        parentCommentId: comments.parentCommentId,
        roadmapItemId: comments.roadmapItemId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          emailVerified: user.emailVerified,
        },
      })
      .from(comments)
      .where(
        and(
          eq(comments.roadmapItemId, roadmapId),
          isNull(comments.parentCommentId),
        ),
      )
      .innerJoin(user, eq(comments.userId, user.id))
      .orderBy(desc(comments.createdAt));

    return {
      ...item,
      category: this.normalizeCategoryName(item.category),
      status: this.normalizeStatusName(item.status),
      hasUpvoted: !!userUpvote,
      comments: commentsData,
    };
  }

  async getAll(
    _page: number = 1,
    filter: {
      status?: RoadmapItem["status"];
      category?: RoadmapItem["category"];
      sortBy?: string;
    },
  ): Promise<{
    total: number;
    data: RoadmapItemsResponse[];
  }> {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const page = Math.max(1, _page); // Ensure page is at least 1

    // 1. Build WHERE filters
    const whereConditions = [];
    if (filter.status) {
      whereConditions.push(eq(roadmapItems.status, filter.status));
    }
    if (filter.category) {
      whereConditions.push(eq(roadmapItems.category, filter.category));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(roadmapItems)
      .where(whereClause);

    const total = totalResult[0]?.count ?? 0;

    // If no items, return early
    if (total === 0) {
      return { total, data: [] };
    }

    const sortBy =
      this.SORT_MAP[filter.sortBy as keyof typeof this.SORT_MAP] ??
      desc(roadmapItems.createdAt);

    const roadmaps = await db
      .select()
      .from(roadmapItems)
      .limit(MAX_POST_PER_PAGE)
      .where(whereClause)
      .offset((page - 1) * MAX_POST_PER_PAGE)
      .orderBy(sortBy);

    const roadmapIds = roadmaps.map((item) => item.id);

    if (roadmapIds.length === 0) {
      return { total, data: [] };
    }

    const userUpvotes = await db
      .select({ roadmapItemId: upvotes.roadmapItemId })
      .from(upvotes)
      .where(
        and(
          inArray(upvotes.roadmapItemId, roadmapIds),
          eq(upvotes.userId, userId),
        ),
      );

    const upvotedSet = new Set(userUpvotes.map((u) => u.roadmapItemId));

    return {
      total,
      data: roadmaps.map((item) => ({
        ...item,
        category: this.normalizeCategoryName(item.category),
        status: this.normalizeStatusName(item.status),
        hasUpvoted: upvotedSet.has(item.id),
      })),
    };
  }

  async upvote(postId: string): Promise<{ upvoted: boolean }> {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // Check if the user already upvoted this post
    const existing = await db.query.upvotes.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.userId, userId), eq(fields.roadmapItemId, postId)),
    });

    if (existing) {
      /* If the user has already upvoted, remove the upvote */

      await db
        .delete(upvotes)
        .where(
          and(eq(upvotes.userId, userId), eq(upvotes.roadmapItemId, postId)),
        );

      // Decrement upvote count
      await db
        .update(roadmapItems)
        .set({
          upvotes: sql`GREATEST(${roadmapItems.upvotes} - 1, 0)`,
        })
        .where(eq(roadmapItems.id, postId));

      return { upvoted: false };
    } else {
      /* If the user has not upvoted, add the upvote */

      await db.insert(upvotes).values({
        userId,
        roadmapItemId: postId,
      });

      // Increment upvotes count
      await db
        .update(roadmapItems)
        .set({
          upvotes: sql`${roadmapItems.upvotes} + 1`,
        })
        .where(eq(roadmapItems.id, postId));

      return { upvoted: true };
    }
  }

  async comment(
    postId: string,
    {
      content,
      parentId,
    }: {
      content: string;
      parentId?: string;
    },
  ): Promise<Comments> {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const schemaResponse = CommentSchema.safeParse({
      content,
      parentCommentId: parentId,
    });
    if (!schemaResponse.success) {
      const errorMessage = schemaResponse.error.issues[0].message;
      throw new Error(errorMessage);
    }

    // 2. Ensure roadmap item exists
    const post = await db.query.roadmapItems.findFirst({
      where: (r, { eq }) => eq(r.id, postId),
      columns: { id: true },
    });

    if (!post) throw new Error("Roadmap item not found");

    // 3. Determine depth
    let depth = 0;

    if (parentId) {
      /* Means it's a reply. So first check parent comment's depth */

      const parent = await db.query.comments.findFirst({
        where: (c, { eq }) => eq(c.id, parentId),
        columns: { depth: true },
      });

      if (!parent) throw new Error("Parent comment not found");
      if (parent.depth >= COMMENT_MAX_DEPTH - 1)
        throw new Error("Maximum nesting level reached");

      depth = parent.depth + 1;
    }

    // 4. Insert comment
    const inserted = await db
      .insert(comments)
      .values({
        roadmapItemId: postId,
        userId,
        content,
        parentCommentId: parentId ?? null,
        depth,
      })
      .returning();

    // 5. Update counters
    if (!parentId) {
      // increment roadmap's comment count when it's a top-level comment
      await db
        .update(roadmapItems)
        .set({
          commentsCount: sql`${roadmapItems.commentsCount} + 1`,
        })
        .where(eq(roadmapItems.id, postId));
    } else {
      // increment parent comment's replies count when it's a reply
      await db
        .update(comments)
        .set({
          repliesCount: sql`${comments.repliesCount} + 1`,
        })
        .where(eq(comments.id, parentId));
    }

    return inserted[0];
  }

  async editComment(
    roadmapId: string,
    {
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    },
  ) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const schemaResponse = CommentSchema.extend({
      id: z
        .string()
        .min(1, "Comment ID is required")
        .max(300, "Comment ID is too long"),
    }).safeParse({
      content,
      id: commentId,
    });
    if (!schemaResponse.success) {
      const errorMessage = schemaResponse.error.issues[0].message;
      throw new Error(errorMessage);
    }

    const comment = await db.query.comments.findFirst({
      where: (c, { eq }) =>
        and(eq(c.id, commentId), eq(c.roadmapItemId, roadmapId)),
    });

    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== userId) throw new Error("Forbidden");

    await db
      .update(comments)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId));

    return { success: true };
  }

  async deleteComment(roadmapId: string, commentId: string) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // fetch the comment
    const comment = await db.query.comments.findFirst({
      where: (c, { eq }) =>
        and(eq(c.id, commentId), eq(c.roadmapItemId, roadmapId)),
      columns: {
        userId: true,
        parentCommentId: true,
        roadmapItemId: true,
      },
    });

    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== userId) throw new Error("Forbidden");

    // delete the comment
    await db.delete(comments).where(eq(comments.id, commentId));

    // decrement counters accordingly
    if (comment.parentCommentId) {
      /* if it's a reply, decrement repliesCount of parent comment */

      await db
        .update(comments)
        .set({
          repliesCount: sql`GREATEST(${comments.repliesCount} - 1, 0)`,
        })
        .where(eq(comments.id, comment.parentCommentId));
    } else {
      /* if it's a top-level comment, decrement commentsCount of roadmap item */

      await db
        .update(roadmapItems)
        .set({
          commentsCount: sql`GREATEST(${roadmapItems.commentsCount} - 1, 0)`,
        })
        .where(eq(roadmapItems.id, comment.roadmapItemId));
    }

    return { success: true };
  }

  async getReplies(
    roadmapItemId: string,
    parentCommentId: string,
  ): Promise<CommentsResponse[]> {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // Fetch all replies to the given parent comment
    const replies = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        depth: comments.depth,
        parentCommentId: comments.parentCommentId,
        repliesCount: comments.repliesCount,
        roadmapItemId: comments.roadmapItemId,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          emailVerified: user.emailVerified,
        },
      })
      .from(comments)
      .innerJoin(user, eq(comments.userId, user.id))
      .where(
        and(
          eq(comments.parentCommentId, parentCommentId),
          eq(comments.roadmapItemId, roadmapItemId),
        ),
      );

    return replies;
  }
}

class DatabaseAPI {
  private static instance: DatabaseAPI;
  public roadmaps: RoadmapsAPI;

  private constructor() {
    this.roadmaps = new RoadmapsAPI();
  }

  public static getInstance(): DatabaseAPI {
    if (!DatabaseAPI.instance) {
      DatabaseAPI.instance = new DatabaseAPI();
    }
    return DatabaseAPI.instance;
  }
}

export const dbAPI = DatabaseAPI.getInstance();
