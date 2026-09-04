import { SignInSchema } from "@/schemas/SignInSchema";

describe("SignInSchema", () => {
  it("accepts a valid email and password", () => {
    const result = SignInSchema.safeParse({
      email: "jane@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = SignInSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than the minimum length", () => {
    const result = SignInSchema.safeParse({
      email: "jane@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("does not require confirmPassword", () => {
    const result = SignInSchema.safeParse({
      email: "jane@example.com",
      password: "password123",
      confirmPassword: "irrelevant",
    });
    expect(result.success).toBe(true);
  });
});
