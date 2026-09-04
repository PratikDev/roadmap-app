import { comments, roadmapItems, upvotes } from "@/db/schemas";

jest.mock("next/headers", () => ({
  headers: jest.fn(async () => new Headers()),
}));

jest.mock("@/lib/auth", () => ({
  auth: { api: { getSession: jest.fn() } },
}));

jest.mock("@/db", () => {
  const actualSchemas = jest.requireActual("@/db/schemas");
  return {
    __esModule: true,
    ...actualSchemas,
    default: {
      query: {
        roadmapItems: { findFirst: jest.fn() },
        upvotes: { findFirst: jest.fn() },
        comments: { findFirst: jest.fn() },
      },
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
});

import { auth } from "@/lib/auth";
import db from "@/db";
import { dbAPI } from "@/db/api";

type Chain = Record<string, jest.Mock> & { returning: jest.Mock };

/** Builds a chainable, thenable stub matching drizzle's fluent query builder. */
function mockChain<T>(result: T): Chain {
  const chain = {} as Chain;
  const methods = [
    "from",
    "where",
    "innerJoin",
    "leftJoin",
    "orderBy",
    "limit",
    "offset",
    "groupBy",
    "values",
    "set",
  ];
  for (const method of methods) {
    chain[method] = jest.fn(() => chain);
  }
  chain.returning = jest.fn(() => Promise.resolve(result));
  // @ts-expect-error -- thenable protocol for implicit `await chain`
  chain.then = (resolve: (v: T) => void, reject?: (e: unknown) => void) =>
    Promise.resolve(result).then(resolve, reject);
  return chain;
}

const mockedGetSession = auth.api.getSession as jest.Mock;
const mockedDb = db as unknown as {
  query: {
    roadmapItems: { findFirst: jest.Mock };
    upvotes: { findFirst: jest.Mock };
    comments: { findFirst: jest.Mock };
  };
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

function loginAs(userId: string) {
  mockedGetSession.mockResolvedValue({ user: { id: userId } });
}

function loggedOut() {
  mockedGetSession.mockResolvedValue(null);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RoadmapsAPI.get", () => {
  it("throws Unauthorized when there is no session", async () => {
    loggedOut();
    await expect(dbAPI.roadmaps.get("roadmap-1")).rejects.toThrow(
      "Unauthorized",
    );
  });

  it("returns undefined when the roadmap item does not exist", async () => {
    loginAs("user-1");
    mockedDb.query.roadmapItems.findFirst.mockResolvedValue(undefined);

    const result = await dbAPI.roadmaps.get("missing-id");
    expect(result).toBeUndefined();
    expect(mockedDb.query.upvotes.findFirst).not.toHaveBeenCalled();
  });

  it("normalizes category/status labels and reports hasUpvoted/comments", async () => {
    loginAs("user-1");
    mockedDb.query.roadmapItems.findFirst.mockResolvedValue({
      id: "roadmap-1",
      category: "api",
      status: "planned",
    });
    mockedDb.query.upvotes.findFirst.mockResolvedValue({ id: "upvote-1" });
    const commentsData = [{ id: "comment-1", content: "hi" }];
    mockedDb.select.mockReturnValueOnce(mockChain(commentsData));

    const result = await dbAPI.roadmaps.get("roadmap-1");

    expect(result).toEqual({
      id: "roadmap-1",
      category: "API",
      status: "Planned",
      hasUpvoted: true,
      comments: commentsData,
    });
  });

  it("reports hasUpvoted: false when the user has not upvoted", async () => {
    loginAs("user-1");
    mockedDb.query.roadmapItems.findFirst.mockResolvedValue({
      id: "roadmap-1",
      category: "api",
      status: "planned",
    });
    mockedDb.query.upvotes.findFirst.mockResolvedValue(undefined);
    mockedDb.select.mockReturnValueOnce(mockChain([]));

    const result = await dbAPI.roadmaps.get("roadmap-1");
    expect(result?.hasUpvoted).toBe(false);
  });

  it("falls back to Unknown Category/Unknown Status for unrecognized values", async () => {
    loginAs("user-1");
    mockedDb.query.roadmapItems.findFirst.mockResolvedValue({
      id: "roadmap-1",
      category: "not-a-real-category",
      status: "not-a-real-status",
    });
    mockedDb.query.upvotes.findFirst.mockResolvedValue(undefined);
    mockedDb.select.mockReturnValueOnce(mockChain([]));

    const result = await dbAPI.roadmaps.get("roadmap-1");
    expect(result?.category).toBe("Unknown Category");
    expect(result?.status).toBe("Unknown Status");
  });
});

describe("RoadmapsAPI.getAll", () => {
  it("throws Unauthorized when there is no session", async () => {
    loggedOut();
    await expect(dbAPI.roadmaps.getAll(1, {})).rejects.toThrow(
      "Unauthorized",
    );
  });

  it("returns early with no data when total is 0", async () => {
    loginAs("user-1");
    mockedDb.select.mockReturnValueOnce(mockChain([{ count: 0 }]));

    const result = await dbAPI.roadmaps.getAll(1, {});
    expect(result).toEqual({ total: 0, data: [] });
    expect(mockedDb.select).toHaveBeenCalledTimes(1);
  });

  it("clamps page to a minimum of 1 when given 0 or a negative page", async () => {
    loginAs("user-1");
    const roadmapsChain = mockChain([{ id: "r1", category: "api", status: "planned" }]);
    mockedDb.select
      .mockReturnValueOnce(mockChain([{ count: 1 }]))
      .mockReturnValueOnce(roadmapsChain)
      .mockReturnValueOnce(mockChain([]));

    await dbAPI.roadmaps.getAll(-5, {});
    expect(roadmapsChain.offset).toHaveBeenCalledWith(0);
  });

  it("computes the correct offset for a given page", async () => {
    loginAs("user-1");
    const roadmapsChain = mockChain([{ id: "r1", category: "api", status: "planned" }]);
    mockedDb.select
      .mockReturnValueOnce(mockChain([{ count: 100 }]))
      .mockReturnValueOnce(roadmapsChain)
      .mockReturnValueOnce(mockChain([]));

    await dbAPI.roadmaps.getAll(3, {});
    expect(roadmapsChain.offset).toHaveBeenCalledWith(40); // (3 - 1) * MAX_POST_PER_PAGE(20)
  });

  it("passes no where clause when no filters are given", async () => {
    loginAs("user-1");
    const countChain = mockChain([{ count: 0 }]);
    mockedDb.select.mockReturnValueOnce(countChain);

    await dbAPI.roadmaps.getAll(1, {});
    expect(countChain.where).toHaveBeenCalledWith(undefined);
  });

  it("passes a combined where clause when status and category filters are given", async () => {
    loginAs("user-1");
    const countChain = mockChain([{ count: 0 }]);
    mockedDb.select.mockReturnValueOnce(countChain);

    await dbAPI.roadmaps.getAll(1, { status: "planned", category: "api" });
    expect(countChain.where).toHaveBeenCalledWith(expect.anything());
    expect(countChain.where.mock.calls[0][0]).not.toBeUndefined();
  });

  it("marks items as hasUpvoted only when the user upvoted them", async () => {
    loginAs("user-1");
    const roadmaps = [
      { id: "r1", category: "api", status: "planned" },
      { id: "r2", category: "backend", status: "completed" },
    ];
    mockedDb.select
      .mockReturnValueOnce(mockChain([{ count: 2 }]))
      .mockReturnValueOnce(mockChain(roadmaps))
      .mockReturnValueOnce(mockChain([{ roadmapItemId: "r2" }]));

    const result = await dbAPI.roadmaps.getAll(1, {});
    expect(result.data.find((r) => r.id === "r1")?.hasUpvoted).toBe(false);
    expect(result.data.find((r) => r.id === "r2")?.hasUpvoted).toBe(true);
    expect(result.data.find((r) => r.id === "r1")?.category).toBe("API");
    expect(result.data.find((r) => r.id === "r2")?.status).toBe("Completed");
  });

  it("returns early without querying upvotes when the page has no roadmaps", async () => {
    loginAs("user-1");
    mockedDb.select
      .mockReturnValueOnce(mockChain([{ count: 5 }]))
      .mockReturnValueOnce(mockChain([]));

    const result = await dbAPI.roadmaps.getAll(99, {});
    expect(result).toEqual({ total: 5, data: [] });
    expect(mockedDb.select).toHaveBeenCalledTimes(2);
  });
});

describe("RoadmapsAPI.upvote", () => {
  it("throws Unauthorized when there is no session", async () => {
    loggedOut();
    await expect(dbAPI.roadmaps.upvote("roadmap-1")).rejects.toThrow(
      "Unauthorized",
    );
  });

  it("removes the upvote and decrements the count when one already exists", async () => {
    loginAs("user-1");
    mockedDb.query.upvotes.findFirst.mockResolvedValue({ id: "upvote-1" });
    mockedDb.delete.mockReturnValueOnce(mockChain(undefined));
    mockedDb.update.mockReturnValueOnce(mockChain(undefined));

    const result = await dbAPI.roadmaps.upvote("roadmap-1");

    expect(result).toEqual({ upvoted: false });
    expect(mockedDb.delete).toHaveBeenCalledWith(upvotes);
    expect(mockedDb.update).toHaveBeenCalledWith(roadmapItems);
    expect(mockedDb.insert).not.toHaveBeenCalled();
  });

  it("adds the upvote and increments the count when none exists", async () => {
    loginAs("user-1");
    mockedDb.query.upvotes.findFirst.mockResolvedValue(undefined);
    mockedDb.insert.mockReturnValueOnce(mockChain(undefined));
    mockedDb.update.mockReturnValueOnce(mockChain(undefined));

    const result = await dbAPI.roadmaps.upvote("roadmap-1");

    expect(result).toEqual({ upvoted: true });
    expect(mockedDb.insert).toHaveBeenCalledWith(upvotes);
    expect(mockedDb.update).toHaveBeenCalledWith(roadmapItems);
    expect(mockedDb.delete).not.toHaveBeenCalled();
  });
});

describe("RoadmapsAPI.comment", () => {
  it("throws Unauthorized when there is no session", async () => {
    loggedOut();
    await expect(
      dbAPI.roadmaps.comment("roadmap-1", { content: "hi" }),
    ).rejects.toThrow("Unauthorized");
  });

  it("throws a validation error for content that is too short", async () => {
    loginAs("user-1");
    await expect(
      dbAPI.roadmaps.comment("roadmap-1", { content: "" }),
    ).rejects.toThrow(/at least/);
  });

  it("throws when the roadmap item does not exist", async () => {
    loginAs("user-1");
    mockedDb.query.roadmapItems.findFirst.mockResolvedValue(undefined);

    await expect(
      dbAPI.roadmaps.comment("missing-roadmap", { content: "hello" }),
    ).rejects.toThrow("Roadmap item not found");
  });

  it("inserts a top-level comment at depth 0 and increments the roadmap's commentsCount", async () => {
    loginAs("user-1");
    mockedDb.query.roadmapItems.findFirst.mockResolvedValue({ id: "roadmap-1" });
    const insertChain = mockChain([{ id: "comment-1", content: "hello" }]);
    mockedDb.insert.mockReturnValueOnce(insertChain);
    mockedDb.update.mockReturnValueOnce(mockChain(undefined));

    const result = await dbAPI.roadmaps.comment("roadmap-1", {
      content: "hello",
    });

    expect(result).toEqual({ id: "comment-1", content: "hello" });
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ depth: 0, parentCommentId: null }),
    );
    expect(mockedDb.update).toHaveBeenCalledWith(roadmapItems);
    expect(mockedDb.update).not.toHaveBeenCalledWith(comments);
  });

  it("throws when the parent comment does not exist", async () => {
    loginAs("user-1");
    mockedDb.query.roadmapItems.findFirst.mockResolvedValue({ id: "roadmap-1" });
    mockedDb.query.comments.findFirst.mockResolvedValue(undefined);

    await expect(
      dbAPI.roadmaps.comment("roadmap-1", {
        content: "hello",
        parentId: "missing-parent",
      }),
    ).rejects.toThrow("Parent comment not found");
  });

  it("throws when the maximum nesting depth would be exceeded", async () => {
    loginAs("user-1");
    mockedDb.query.roadmapItems.findFirst.mockResolvedValue({ id: "roadmap-1" });
    mockedDb.query.comments.findFirst.mockResolvedValue({ depth: 2 }); // COMMENT_MAX_DEPTH - 1

    await expect(
      dbAPI.roadmaps.comment("roadmap-1", {
        content: "hello",
        parentId: "parent-1",
      }),
    ).rejects.toThrow("Maximum nesting level reached");
  });

  it("inserts a reply at parent.depth + 1 and increments the parent's repliesCount", async () => {
    loginAs("user-1");
    mockedDb.query.roadmapItems.findFirst.mockResolvedValue({ id: "roadmap-1" });
    mockedDb.query.comments.findFirst.mockResolvedValue({ depth: 1 });
    const insertChain = mockChain([{ id: "reply-1", content: "reply" }]);
    mockedDb.insert.mockReturnValueOnce(insertChain);
    mockedDb.update.mockReturnValueOnce(mockChain(undefined));

    await dbAPI.roadmaps.comment("roadmap-1", {
      content: "reply",
      parentId: "parent-1",
    });

    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ depth: 2, parentCommentId: "parent-1" }),
    );
    expect(mockedDb.update).toHaveBeenCalledWith(comments);
    expect(mockedDb.update).not.toHaveBeenCalledWith(roadmapItems);
  });
});

describe("RoadmapsAPI.editComment", () => {
  it("throws Unauthorized when there is no session", async () => {
    loggedOut();
    await expect(
      dbAPI.roadmaps.editComment("roadmap-1", {
        commentId: "comment-1",
        content: "updated",
      }),
    ).rejects.toThrow("Unauthorized");
  });

  it("throws a validation error for an empty commentId", async () => {
    loginAs("user-1");
    await expect(
      dbAPI.roadmaps.editComment("roadmap-1", {
        commentId: "",
        content: "updated",
      }),
    ).rejects.toThrow();
  });

  it("throws when the comment does not exist", async () => {
    loginAs("user-1");
    mockedDb.query.comments.findFirst.mockResolvedValue(undefined);

    await expect(
      dbAPI.roadmaps.editComment("roadmap-1", {
        commentId: "comment-1",
        content: "updated",
      }),
    ).rejects.toThrow("Comment not found");
  });

  it("throws Forbidden when the comment belongs to another user", async () => {
    loginAs("user-1");
    mockedDb.query.comments.findFirst.mockResolvedValue({ userId: "user-2" });

    await expect(
      dbAPI.roadmaps.editComment("roadmap-1", {
        commentId: "comment-1",
        content: "updated",
      }),
    ).rejects.toThrow("Forbidden");
  });

  it("updates the comment content when the user owns it", async () => {
    loginAs("user-1");
    mockedDb.query.comments.findFirst.mockResolvedValue({ userId: "user-1" });
    const updateChain = mockChain(undefined);
    mockedDb.update.mockReturnValueOnce(updateChain);

    const result = await dbAPI.roadmaps.editComment("roadmap-1", {
      commentId: "comment-1",
      content: "updated",
    });

    expect(result).toEqual({ success: true });
    expect(mockedDb.update).toHaveBeenCalledWith(comments);
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ content: "updated" }),
    );
  });
});

describe("RoadmapsAPI.deleteComment", () => {
  it("throws Unauthorized when there is no session", async () => {
    loggedOut();
    await expect(
      dbAPI.roadmaps.deleteComment("roadmap-1", "comment-1"),
    ).rejects.toThrow("Unauthorized");
  });

  it("throws when the comment does not exist", async () => {
    loginAs("user-1");
    mockedDb.query.comments.findFirst.mockResolvedValue(undefined);

    await expect(
      dbAPI.roadmaps.deleteComment("roadmap-1", "comment-1"),
    ).rejects.toThrow("Comment not found");
  });

  it("throws Forbidden when the comment belongs to another user", async () => {
    loginAs("user-1");
    mockedDb.query.comments.findFirst.mockResolvedValue({ userId: "user-2" });

    await expect(
      dbAPI.roadmaps.deleteComment("roadmap-1", "comment-1"),
    ).rejects.toThrow("Forbidden");
  });

  it("decrements the parent's repliesCount when deleting a reply", async () => {
    loginAs("user-1");
    mockedDb.query.comments.findFirst.mockResolvedValue({
      userId: "user-1",
      parentCommentId: "parent-1",
      roadmapItemId: "roadmap-1",
    });
    mockedDb.delete.mockReturnValueOnce(mockChain(undefined));
    mockedDb.update.mockReturnValueOnce(mockChain(undefined));

    const result = await dbAPI.roadmaps.deleteComment("roadmap-1", "comment-1");

    expect(result).toEqual({ success: true });
    expect(mockedDb.update).toHaveBeenCalledWith(comments);
    expect(mockedDb.update).not.toHaveBeenCalledWith(roadmapItems);
  });

  it("decrements the roadmap's commentsCount when deleting a top-level comment", async () => {
    loginAs("user-1");
    mockedDb.query.comments.findFirst.mockResolvedValue({
      userId: "user-1",
      parentCommentId: null,
      roadmapItemId: "roadmap-1",
    });
    mockedDb.delete.mockReturnValueOnce(mockChain(undefined));
    mockedDb.update.mockReturnValueOnce(mockChain(undefined));

    const result = await dbAPI.roadmaps.deleteComment("roadmap-1", "comment-1");

    expect(result).toEqual({ success: true });
    expect(mockedDb.update).toHaveBeenCalledWith(roadmapItems);
    expect(mockedDb.update).not.toHaveBeenCalledWith(comments);
  });
});

describe("RoadmapsAPI.getReplies", () => {
  it("throws Unauthorized when there is no session", async () => {
    loggedOut();
    await expect(
      dbAPI.roadmaps.getReplies("roadmap-1", "parent-1"),
    ).rejects.toThrow("Unauthorized");
  });

  it("returns the replies for a given parent comment", async () => {
    loginAs("user-1");
    const replies = [{ id: "reply-1", content: "hi" }];
    mockedDb.select.mockReturnValueOnce(mockChain(replies));

    const result = await dbAPI.roadmaps.getReplies("roadmap-1", "parent-1");
    expect(result).toEqual(replies);
  });
});
