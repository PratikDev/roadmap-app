import {
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const roadmapStatusEnum = pgEnum("roadmap_status", [
	"planned",
	"in_progress",
	"completed",
	"cancelled",
	"archived",
]);

export const roadmapItems = pgTable(
	"roadmap_items",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		title: varchar({ length: 255 }).notNull(),
		description: text().notNull(),
		status: roadmapStatusEnum().notNull(),
		category: varchar({ length: 100 }),
		upvotes: integer().default(0).notNull(),
		createdAt: timestamp({ withTimezone: true }).defaultNow(),
		updatedAt: timestamp({ withTimezone: true }).defaultNow(),
	},
	(table) => [
		index("idx_roadmap_items_status").on(table.status),
		index("idx_roadmap_items_category").on(table.category),
		index("idx_roadmap_items_upvotes").on(table.upvotes),
	]
);
