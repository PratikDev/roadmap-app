import { NextRequest } from "next/server";

jest.mock("@/db/api", () => ({
  dbAPI: {
    roadmaps: {
      comment: jest.fn(),
      getReplies: jest.fn(),
      editComment: jest.fn(),
      deleteComment: jest.fn(),
    },
  },
}));

import { dbAPI } from "@/db/api";
import { DELETE, GET, POST, PUT } from "../route";

const mockedRoadmaps = dbAPI.roadmaps as unknown as {
  comment: jest.Mock;
  getReplies: jest.Mock;
  editComment: jest.Mock;
  deleteComment: jest.Mock;
};

const params = Promise.resolve({ roadmapId: "roadmap-1" });

function makeRequest(
  url: string,
  init?: ConstructorParameters<typeof NextRequest>[1],
) {
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("POST /api/comment/[roadmapId]", () => {
  it("delegates to dbAPI.roadmaps.comment and returns its result", async () => {
    mockedRoadmaps.comment.mockResolvedValue({ id: "comment-1" });

    const response = await POST(
      makeRequest("/api/comment/roadmap-1", {
        method: "POST",
        body: JSON.stringify({ content: "hello", parentId: "parent-1" }),
      }),
      { params },
    );

    expect(mockedRoadmaps.comment).toHaveBeenCalledWith("roadmap-1", {
      content: "hello",
      parentId: "parent-1",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: "comment-1" });
  });

  it("returns a 500 with a generic message when the API layer throws", async () => {
    mockedRoadmaps.comment.mockRejectedValue(new Error("boom"));

    const response = await POST(
      makeRequest("/api/comment/roadmap-1", {
        method: "POST",
        body: JSON.stringify({ content: "hello" }),
      }),
      { params },
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to comment on post",
    });
  });
});

describe("GET /api/comment/[roadmapId]", () => {
  it("returns 400 when parentCommentId is missing", async () => {
    const response = await GET(makeRequest("/api/comment/roadmap-1"), {
      params,
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "parentCommentId is required",
    });
    expect(mockedRoadmaps.getReplies).not.toHaveBeenCalled();
  });

  it("delegates to dbAPI.roadmaps.getReplies with the parsed query param", async () => {
    mockedRoadmaps.getReplies.mockResolvedValue([{ id: "reply-1" }]);

    const response = await GET(
      makeRequest("/api/comment/roadmap-1?parentCommentId=parent-1"),
      { params },
    );

    expect(mockedRoadmaps.getReplies).toHaveBeenCalledWith(
      "roadmap-1",
      "parent-1",
    );
    expect(await response.json()).toEqual([{ id: "reply-1" }]);
  });

  it("returns a 500 with a generic message when the API layer throws", async () => {
    mockedRoadmaps.getReplies.mockRejectedValue(new Error("boom"));

    const response = await GET(
      makeRequest("/api/comment/roadmap-1?parentCommentId=parent-1"),
      { params },
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to fetch replies",
    });
  });
});

describe("PUT /api/comment/[roadmapId]", () => {
  it("delegates to dbAPI.roadmaps.editComment", async () => {
    mockedRoadmaps.editComment.mockResolvedValue({ success: true });

    const response = await PUT(
      makeRequest("/api/comment/roadmap-1", {
        method: "PUT",
        body: JSON.stringify({ content: "updated", id: "comment-1" }),
      }),
      { params },
    );

    expect(mockedRoadmaps.editComment).toHaveBeenCalledWith("roadmap-1", {
      content: "updated",
      commentId: "comment-1",
    });
    expect(await response.json()).toEqual({ success: true });
  });

  it("returns a 500 with a generic message when the API layer throws", async () => {
    mockedRoadmaps.editComment.mockRejectedValue(new Error("boom"));

    const response = await PUT(
      makeRequest("/api/comment/roadmap-1", {
        method: "PUT",
        body: JSON.stringify({ content: "updated", id: "comment-1" }),
      }),
      { params },
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to update comment",
    });
  });
});

describe("DELETE /api/comment/[roadmapId]", () => {
  it("returns 400 when commentId is missing", async () => {
    const response = await DELETE(
      makeRequest("/api/comment/roadmap-1", {
        method: "DELETE",
        body: JSON.stringify({}),
      }),
      { params },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "commentId is required" });
    expect(mockedRoadmaps.deleteComment).not.toHaveBeenCalled();
  });

  it("returns 400 when commentId is blank", async () => {
    const response = await DELETE(
      makeRequest("/api/comment/roadmap-1", {
        method: "DELETE",
        body: JSON.stringify({ commentId: "   " }),
      }),
      { params },
    );

    expect(response.status).toBe(400);
  });

  it("delegates to dbAPI.roadmaps.deleteComment when commentId is valid", async () => {
    mockedRoadmaps.deleteComment.mockResolvedValue({ success: true });

    const response = await DELETE(
      makeRequest("/api/comment/roadmap-1", {
        method: "DELETE",
        body: JSON.stringify({ commentId: "comment-1" }),
      }),
      { params },
    );

    expect(mockedRoadmaps.deleteComment).toHaveBeenCalledWith(
      "roadmap-1",
      "comment-1",
    );
    expect(await response.json()).toEqual({ success: true });
  });

  it("returns a 500 with a generic message when the API layer throws", async () => {
    mockedRoadmaps.deleteComment.mockRejectedValue(new Error("boom"));

    const response = await DELETE(
      makeRequest("/api/comment/roadmap-1", {
        method: "DELETE",
        body: JSON.stringify({ commentId: "comment-1" }),
      }),
      { params },
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to delete comment",
    });
  });
});
