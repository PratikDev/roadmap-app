import {
	AnyPgColumn,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { roadmapItems } from "./roadmap-schema";

export const comments = pgTable("comments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	roadmapItemId: integer()
		.references(() => roadmapItems.id, { onDelete: "cascade" })
		.notNull(),
	userId: integer()
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	content: text().notNull(),
	parentCommentId: integer().references((): AnyPgColumn => comments.id, {
		onDelete: "cascade",
	}),
	depth: integer().notNull().default(0),
	createdAt: timestamp({ withTimezone: true }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});
