import { z } from "zod/v4";

import { SignUpSchema } from "./SignUpSchema";

export const SignInSchema = z.object({
  email: SignUpSchema.shape.email,
  password: SignUpSchema.shape.password,
});
