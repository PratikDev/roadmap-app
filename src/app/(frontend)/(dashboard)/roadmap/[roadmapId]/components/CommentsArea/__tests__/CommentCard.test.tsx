import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { authClient } from "@/lib/auth-client";
import { CommentsResponse } from "@/types/Responses";
import CommentCard from "../CommentCard";

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
const mockedToastSuccess = toast.success as jest.Mock;

function mockSession(userId: string | null) {
  mockedUseSession.mockReturnValue({
    isPending: false,
    data: userId ? { user: { id: userId } } : null,
  });
}

const baseComment: CommentsResponse = {
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
};

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("CommentCard", () => {
  it("renders the author name and comment content", () => {
    mockSession(null);
    render(<CommentCard {...baseComment} onRemove={jest.fn()} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("This is a great idea")).toBeInTheDocument();
    expect(screen.getByText(/2 days ago/)).toBeInTheDocument();
  });

  it("hides edit/delete controls for a non-owner", () => {
    mockSession("someone-else");
    render(<CommentCard {...baseComment} onRemove={jest.fn()} />);

    expect(screen.queryByText("Edit Comment")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete Comment")).not.toBeInTheDocument();
  });

  it("shows edit/delete controls for the comment owner", () => {
    mockSession("user-1");
    render(<CommentCard {...baseComment} onRemove={jest.fn()} />);

    expect(screen.getByText("Edit Comment")).toBeInTheDocument();
    expect(screen.getByText("Delete Comment")).toBeInTheDocument();
  });

  it("hides the reply-count button once the max nesting depth is reached", () => {
    mockSession("user-1");
    render(
      <CommentCard {...baseComment} depth={2} onRemove={jest.fn()} />,
    );
    // depth 2 === COMMENT_MAX_DEPTH - 1, so no more replies are allowed
    expect(screen.queryByRole("button", { name: "0" })).not.toBeInTheDocument();
  });

  it("edits the comment content optimistically and persists it", async () => {
    mockSession("user-1");
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<CommentCard {...baseComment} onRemove={jest.fn()} />);

    await userEvent.click(screen.getByText("Edit Comment"));
    const input = screen.getByDisplayValue("This is a great idea");
    await userEvent.clear(input);
    await userEvent.type(input, "Updated content{Enter}");

    expect(await screen.findByText("Updated content")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/comment/roadmap-1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ content: "Updated content", id: "comment-1" }),
      }),
    );
  });

  it("rejects an empty edit without submitting, via toast error", async () => {
    mockSession("user-1");
    render(<CommentCard {...baseComment} onRemove={jest.fn()} />);

    await userEvent.click(screen.getByText("Edit Comment"));
    const input = screen.getByDisplayValue("This is a great idea");
    await userEvent.clear(input);
    await userEvent.keyboard("{Enter}");

    expect(mockedToastError).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("reverts the edit and shows a toast when the PUT request fails", async () => {
    mockSession("user-1");
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    jest.spyOn(console, "error").mockImplementation(() => {});
    render(<CommentCard {...baseComment} onRemove={jest.fn()} />);

    await userEvent.click(screen.getByText("Edit Comment"));
    const input = screen.getByDisplayValue("This is a great idea");
    await userEvent.clear(input);
    await userEvent.type(input, "Updated content{Enter}");

    await waitFor(() => {
      expect(screen.getByText("This is a great idea")).toBeInTheDocument();
    });
    expect(mockedToastError).toHaveBeenCalledWith(
      "Failed to edit comment. Please try again.",
    );
  });

  it("deletes the comment and calls onRemove on success", async () => {
    mockSession("user-1");
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    const onRemove = jest.fn();
    render(<CommentCard {...baseComment} onRemove={onRemove} />);

    await userEvent.click(screen.getByText("Delete Comment"));

    await waitFor(() => {
      expect(onRemove).toHaveBeenCalledWith("comment-1");
    });
    expect(mockedToastSuccess).toHaveBeenCalledWith(
      "Comment deleted successfully",
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/comment/roadmap-1",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ commentId: "comment-1" }),
      }),
    );
  });

  it("shows a toast and does not call onRemove when deletion fails", async () => {
    mockSession("user-1");
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    jest.spyOn(console, "error").mockImplementation(() => {});
    const onRemove = jest.fn();
    render(<CommentCard {...baseComment} onRemove={onRemove} />);

    await userEvent.click(screen.getByText("Delete Comment"));

    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(
        "Failed to delete comment. Please try again.",
      );
    });
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("fetches and displays replies when the reply button is clicked", async () => {
    mockSession("user-1");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          ...baseComment,
          id: "reply-1",
          content: "A reply",
          depth: 1,
          parentCommentId: "comment-1",
        },
      ],
    });

    render(
      <CommentCard {...baseComment} repliesCount={1} onRemove={jest.fn()} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "1" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/comment/roadmap-1?parentCommentId=comment-1",
      expect.objectContaining({ method: "GET" }),
    );
    expect(await screen.findByText("A reply")).toBeInTheDocument();
  });

  it("logs an error and stops loading when fetching replies fails", async () => {
    mockSession("user-1");
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <CommentCard {...baseComment} repliesCount={1} onRemove={jest.fn()} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "1" }));

    await waitFor(() => {
      expect(screen.queryByText("Loading replies...")).not.toBeInTheDocument();
    });
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching replies:",
      expect.any(Error),
    );
  });

  it("collapses replies on a second click without re-fetching", async () => {
    mockSession("user-1");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(
      <CommentCard {...baseComment} repliesCount={0} onRemove={jest.fn()} />,
    );

    const replyButton = screen.getByRole("button", { name: "0" });
    await userEvent.click(replyButton);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    await userEvent.click(replyButton);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
