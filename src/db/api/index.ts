import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { RoadmapItemsResponse } from "@/types/Responses";
import db, { RoadmapItem, roadmapItems, upvotes } from "../";

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

  async upvote(postId: string) {
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
