import { cn, getEnv } from "@/lib/utils";

describe("cn", () => {
  it("joins plain class name strings", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", null, undefined, 0 && "d", "e")).toBe("a e");
  });

  it("supports clsx-style conditional objects", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("merges conflicting tailwind classes, keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("keeps non-conflicting classes when merging", () => {
    expect(cn("flex items-center", "gap-2")).toBe("flex items-center gap-2");
  });
});

describe("getEnv", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns the value when the environment variable is set", () => {
    process.env.DATABASE_URL = "postgres://example";
    expect(getEnv("DATABASE_URL")).toBe("postgres://example");
  });

  it("throws a descriptive error when the environment variable is missing", () => {
    delete process.env.DATABASE_URL;
    expect(() => getEnv("DATABASE_URL")).toThrow(
      "Missing environment variable DATABASE_URL",
    );
  });

  it("throws when the environment variable is set to an empty string", () => {
    process.env.DATABASE_URL = "";
    expect(() => getEnv("DATABASE_URL")).toThrow(
      "Missing environment variable DATABASE_URL",
    );
  });
});
