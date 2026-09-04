import { SignUpSchema } from "@/schemas/SignUpSchema";

const validInput = {
  name: "Jane Doe",
  email: "jane@example.com",
  password: "password123",
  confirmPassword: "password123",
};

describe("SignUpSchema", () => {
  it("accepts a valid sign-up payload", () => {
    const result = SignUpSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = SignUpSchema.safeParse({ ...validInput, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than the max length", () => {
    const result = SignUpSchema.safeParse({
      ...validInput,
      name: "a".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from the name", () => {
    const result = SignUpSchema.safeParse({ ...validInput, name: "  Jane  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Jane");
    }
  });

  it("rejects an invalid email format", () => {
    const result = SignUpSchema.safeParse({
      ...validInput,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than the minimum length", () => {
    const result = SignUpSchema.safeParse({
      ...validInput,
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password longer than the maximum length", () => {
    const longPassword = "a".repeat(301);
    const result = SignUpSchema.safeParse({
      ...validInput,
      password: longPassword,
      confirmPassword: longPassword,
    });
    expect(result.success).toBe(false);
  });

  it("rejects when password and confirmPassword don't match", () => {
    const result = SignUpSchema.safeParse({
      ...validInput,
      confirmPassword: "somethingElse123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Passwords don't match");
    }
  });
});
