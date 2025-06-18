import {
	AnyPgColumn,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
});

export const roadmapStatusEnum = pgEnum("roadmap_status", [
	"planned",
	"in_progress",
	"completed",
	"cancelled",
	"archived",
]);

export const roadmapItemsTable = pgTable(
	"roadmap_items",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		title: varchar({ length: 255 }).notNull(),
		description: text("description").notNull(),
		status: roadmapStatusEnum("status").notNull(),
		category: varchar({ length: 100 }),
		upvotes: integer().default(0).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	},
	(table) => [
		index("idx_roadmap_items_status").on(table.status),
		index("idx_roadmap_items_category").on(table.category),
		index("idx_roadmap_items_upvotes").on(table.upvotes),
	]
);

export const upvotesTable = pgTable(
	"upvotes",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		userId: integer()
			.references(() => usersTable.id)
			.notNull(),
		roadmapItemId: integer()
			.references(() => roadmapItemsTable.id)
			.notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
	(table) => [unique().on(table.userId, table.roadmapItemId)]
);

export const commentsTable = pgTable("comments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	roadmapItemId: integer()
		.references(() => roadmapItemsTable.id)
		.notNull(),
	userId: integer()
		.references(() => usersTable.id)
		.notNull(),
	content: text("content").notNull(),
	parentCommentId: integer().references((): AnyPgColumn => commentsTable.id),
	depth: integer().notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
