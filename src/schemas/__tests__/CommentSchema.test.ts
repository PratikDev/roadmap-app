import { CommentSchema } from "@/schemas/CommentSchema";

describe("CommentSchema", () => {
  it("accepts valid content without a parentCommentId", () => {
    const result = CommentSchema.safeParse({ content: "Great idea!" });
    expect(result.success).toBe(true);
  });

  it("accepts valid content with a parentCommentId", () => {
    const result = CommentSchema.safeParse({
      content: "Agreed",
      parentCommentId: "some-comment-id",
    });
    expect(result.success).toBe(true);
  });

  it("trims content before validating", () => {
    const result = CommentSchema.safeParse({ content: "  hello  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe("hello");
    }
  });

  it("rejects empty content (after trimming whitespace)", () => {
    const result = CommentSchema.safeParse({ content: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects content longer than the max length", () => {
    const result = CommentSchema.safeParse({ content: "a".repeat(1001) });
    expect(result.success).toBe(false);
  });

  it("accepts content exactly at the max length", () => {
    const result = CommentSchema.safeParse({ content: "a".repeat(1000) });
    expect(result.success).toBe(true);
  });
});
