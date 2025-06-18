import { integer, pgTable, timestamp, unique } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { roadmapItems } from "./roadmap-schema";

export const upvotes = pgTable(
	"upvotes",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		userId: integer()
			.references(() => user.id, { onDelete: "cascade" })
			.notNull(),
		roadmapItemId: integer()
			.references(() => roadmapItems.id, { onDelete: "cascade" })
			.notNull(),
		createdAt: timestamp({ withTimezone: true }).defaultNow(),
	},
	(table) => [unique().on(table.userId, table.roadmapItemId)]
);
