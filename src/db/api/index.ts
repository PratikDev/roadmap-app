import { and, desc, eq, inArray } from "drizzle-orm";
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
