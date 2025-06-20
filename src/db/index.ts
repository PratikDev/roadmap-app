import { drizzle } from "drizzle-orm/neon-http";

import { getEnv } from "@/lib/utils";
import { comments, roadmapItems, upvotes, user } from "./schemas";

const db = drizzle(getEnv("DATABASE_URL"), {
  schema: {
    upvotes,
    roadmapItems,
    comments,
    user,
  },
});

export default db;
export * from "./schemas";
