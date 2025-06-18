import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull(),
	email: text().notNull().unique(),
	emailVerified: boolean().default(false).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const session = pgTable("session", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	expiresAt: timestamp({ withTimezone: true }).notNull(),
	token: text().notNull().unique(),
	createdAt: timestamp({ withTimezone: true }).notNull(),
	updatedAt: timestamp({ withTimezone: true }).notNull(),
	ipAddress: text().notNull(),
	userAgent: text().notNull(),
	userId: integer()
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
});

export const account = pgTable("account", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: integer()
		.references(() => user.id, { onDelete: "cascade" })
		.notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ withTimezone: true }),
	refreshTokenExpiresAt: timestamp({ withTimezone: true }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ withTimezone: true }).notNull(),
	updatedAt: timestamp({ withTimezone: true }).notNull(),
});

export const verification = pgTable("verification", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ withTimezone: true }).notNull(),
	createdAt: timestamp({ withTimezone: true }).defaultNow(),
	updatedAt: timestamp({ withTimezone: true }).defaultNow(),
});
