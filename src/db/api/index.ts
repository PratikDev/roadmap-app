import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { headers } from "next/headers";

import { COMMENT_MAX_DEPTH } from "@/constants";
import { auth } from "@/lib/auth";
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
    switch (category) {
      case "api":
        return "API";
      case "backend":
        return "Backend";
      case "frontend":
        return "Frontend";
      case "bugfix":
        return "Bugfix";
      case "infra":
        return "Infrastructure";
      case "mobile":
        return "Mobile";
      case "performance":
        return "Performance";
      case "security":
        return "Security";
      case "ux":
        return "UX";
    }
  }

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
      hasUpvoted: !!userUpvote,
      comments: commentsData,
    };
  }

  async getAll(): Promise<RoadmapItemsResponse[]> {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const roadmaps = await db
      .select()
      .from(roadmapItems)
      .orderBy(desc(roadmapItems.createdAt));

    const roadmapIds = roadmaps.map((item) => item.id);

    if (roadmapIds.length === 0) {
      return [];
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

    return roadmaps.map((item) => ({
      ...item,
      category: this.normalizeCategoryName(item.category),
      hasUpvoted: upvotedSet.has(item.id),
    }));
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

    /* TODO: Add schema validation */

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
