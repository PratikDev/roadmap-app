import { defineConfig } from "drizzle-kit";

import { getEnv } from "@/lib/utils";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schemas/index.ts",
	dbCredentials: {
		url: getEnv("DATABASE_URL"),
	},
});
