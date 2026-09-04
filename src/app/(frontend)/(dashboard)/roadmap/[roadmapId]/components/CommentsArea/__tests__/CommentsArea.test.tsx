import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { authClient } from "@/lib/auth-client";
import { CommentsResponse } from "@/types/Responses";
import CommentsArea from "../index";

jest.mock("date-fns", () => ({
  formatDistance: jest.fn(() => "2 days ago"),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/lib/auth-client", () => ({
  authClient: { useSession: jest.fn() },
}));

import toast from "react-hot-toast";

const mockedUseSession = authClient.useSession as jest.Mock;
const mockedToastError = toast.error as jest.Mock;

function mockSession(userId: string | null) {
  mockedUseSession.mockReturnValue({
    isPending: false,
    data: userId ? { user: { id: userId } } : null,
  });
}

function makeComment(overrides: Partial<CommentsResponse> = {}): CommentsResponse {
  return {
    id: "comment-1",
    content: "This is a great idea",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
    depth: 0,
    repliesCount: 0,
    parentCommentId: null,
    roadmapItemId: "roadmap-1",
    user: {
      id: "user-1",
      name: "Alice",
      email: "alice@example.com",
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: true,
    },
    ...overrides,
  };
}

beforeEach(() => {
  global.fetch = jest.fn();
  mockSession(null);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("CommentsArea", () => {
  it("shows 'No comments yet.' at depth 0 with no threads", () => {
    render(<CommentsArea threads={[]} roadmapItemId="roadmap-1" depth={0} />);
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  it("does not show the empty state below depth 0", () => {
    render(<CommentsArea threads={[]} roadmapItemId="roadmap-1" depth={1} />);
    expect(screen.queryByText("No comments yet.")).not.toBeInTheDocument();
  });

  it("renders each provided thread", () => {
    render(
      <CommentsArea
        threads={[makeComment()]}
        roadmapItemId="roadmap-1"
        depth={0}
      />,
    );
    expect(screen.getByText("This is a great idea")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("shows the top-level placeholder at depth 0", () => {
    render(<CommentsArea threads={[]} roadmapItemId="roadmap-1" depth={0} />);
    expect(
      screen.getByPlaceholderText("Add a comment..."),
    ).toBeInTheDocument();
  });

  it("shows the reply placeholder below depth 0", () => {
    render(<CommentsArea threads={[]} roadmapItemId="roadmap-1" depth={1} />);
    expect(screen.getByPlaceholderText("Reply...")).toBeInTheDocument();
  });

  it("hides the comment form once the max nesting depth is reached", () => {
    render(<CommentsArea threads={[]} roadmapItemId="roadmap-1" depth={3} />);
    expect(screen.queryByPlaceholderText(/comment|reply/i)).not.toBeInTheDocument();
  });

  it("still shows the form just below the max nesting depth", () => {
    render(<CommentsArea threads={[]} roadmapItemId="roadmap-1" depth={2} />);
    expect(screen.getByPlaceholderText("Reply...")).toBeInTheDocument();
  });

  it("optimistically adds a new comment and posts it to the API", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<CommentsArea threads={[]} roadmapItemId="roadmap-1" depth={0} />);

    const input = screen.getByPlaceholderText("Add a comment...");
    await userEvent.type(input, "My new comment{Enter}");

    expect(await screen.findByText("My new comment")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/comment/roadmap-1",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ content: "My new comment", parentId: null }),
      }),
    );
  });

  it("rejects empty content without an optimistic update or a fetch call", async () => {
    render(<CommentsArea threads={[]} roadmapItemId="roadmap-1" depth={0} />);

    const input = screen.getByPlaceholderText("Add a comment...");
    await userEvent.type(input, "   {Enter}");

    expect(mockedToastError).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });

  it("rolls back the optimistic comment when the POST fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    jest.spyOn(console, "error").mockImplementation(() => {});
    render(<CommentsArea threads={[]} roadmapItemId="roadmap-1" depth={0} />);

    const input = screen.getByPlaceholderText("Add a comment...");
    await userEvent.type(input, "My new comment{Enter}");

    // The mocked fetch rejection resolves within the same act() flush as the
    // optimistic update, so only the settled (rolled-back) state is observable here.
    await waitFor(() => {
      expect(screen.queryByText("My new comment")).not.toBeInTheDocument();
    });
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
    expect(mockedToastError).toHaveBeenCalledWith(
      "Failed to submit comment. Please try again.",
    );
  });

  it("passes parentCommentId as parentId when replying", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(
      <CommentsArea
        threads={[]}
        roadmapItemId="roadmap-1"
        depth={1}
        parentCommentId="parent-1"
      />,
    );

    const input = screen.getByPlaceholderText("Reply...");
    await userEvent.type(input, "A reply{Enter}");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/comment/roadmap-1",
        expect.objectContaining({
          body: JSON.stringify({ content: "A reply", parentId: "parent-1" }),
        }),
      );
    });
  });

  it("removes a comment from the list once it's deleted", async () => {
    mockSession("user-1"); // the comment's owner, so the delete button renders
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(
      <CommentsArea
        threads={[makeComment({ user: { ...makeComment().user, id: "user-1" } })]}
        roadmapItemId="roadmap-1"
        depth={0}
      />,
    );

    expect(screen.getByText("This is a great idea")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Delete Comment"));

    await waitFor(() => {
      expect(screen.queryByText("This is a great idea")).not.toBeInTheDocument();
    });
    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });
});
