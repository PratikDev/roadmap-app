import { getEnv } from "@/lib/utils";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	dbCredentials: {
		url: getEnv("DATABASE_URL"),
	},
});
