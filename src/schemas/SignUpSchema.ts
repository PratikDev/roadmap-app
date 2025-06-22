import {
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "@/constants";
import { z } from "zod/v4";

export const PasswordSchema = z
  .string()
  .trim()
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
  )
  .max(
    MAX_PASSWORD_LENGTH,
    `Password must be at most ${MAX_PASSWORD_LENGTH} characters long`,
  );

export const SignUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(MIN_NAME_LENGTH, "Name is required")
      .max(
        MAX_NAME_LENGTH,
        `Name must be at most ${MAX_NAME_LENGTH} characters long`,
      ),
    email: z.email(),
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
  });
