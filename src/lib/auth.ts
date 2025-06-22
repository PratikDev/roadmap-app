import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { validator } from "validation-better-auth";

import db from "@/db";
import * as authSchema from "@/db/schemas/auth-schema";
import { SignInSchema } from "@/schemas/SignInSchema";
import { SignUpSchema } from "@/schemas/SignUpSchema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    validator([
      {
        path: "/sign-up/email",
        schema: SignUpSchema.omit({
          confirmPassword: true, // omitting cause we can't pass confirmPassword to better-auth
        }),
      },
      {
        path: "/sign-in/email",
        schema: SignInSchema,
      },
    ]),
  ],
  advanced: {
    database: {
      generateId: false, // disabled better-auth ID generation cuz it was creating text IDs instead of UUIDs
    },
  },
  appName: "Roadmap App",
});
