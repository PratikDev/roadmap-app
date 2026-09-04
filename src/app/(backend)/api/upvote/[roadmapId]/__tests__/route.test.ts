jest.mock("@/db/api", () => ({
  dbAPI: {
    roadmaps: {
      upvote: jest.fn(),
    },
  },
}));

import { dbAPI } from "@/db/api";
import { PUT } from "../route";

const mockedUpvote = dbAPI.roadmaps.upvote as jest.Mock;

const params = Promise.resolve({ roadmapId: "roadmap-1" });

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("PUT /api/upvote/[roadmapId]", () => {
  it("delegates to dbAPI.roadmaps.upvote and returns its result", async () => {
    mockedUpvote.mockResolvedValue({ upvoted: true });

    const response = await PUT(undefined, { params });

    expect(mockedUpvote).toHaveBeenCalledWith("roadmap-1");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ upvoted: true });
  });

  it("returns a 500 with a generic message when the API layer throws", async () => {
    mockedUpvote.mockRejectedValue(new Error("boom"));

    const response = await PUT(undefined, { params });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "Failed to upvote post",
    });
  });
});
