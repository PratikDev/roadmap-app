import { drizzle } from "drizzle-orm/neon-http";

import { getEnv } from "@/lib/utils";

const db = drizzle(getEnv("DATABASE_URL"));

export default db;
export * from "./schemas";
