import { pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { roadmapItems } from "./roadmap-schema";

export const upvotes = pgTable(
  "upvotes",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid()
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    roadmapItemId: uuid()
      .references(() => roadmapItems.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [unique().on(table.userId, table.roadmapItemId)],
);
