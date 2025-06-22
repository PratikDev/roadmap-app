import {
  AnyPgColumn,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { roadmapItems } from "./roadmap-schema";

export const comments = pgTable("comments", {
  id: uuid().primaryKey().defaultRandom(),
  roadmapItemId: uuid()
    .references(() => roadmapItems.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid()
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  content: text().notNull(),
  parentCommentId: uuid().references((): AnyPgColumn => comments.id, {
    onDelete: "cascade",
  }),
  depth: integer().notNull().default(0),
  repliesCount: integer().notNull().default(0),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});
export type Comments = typeof comments.$inferSelect;
