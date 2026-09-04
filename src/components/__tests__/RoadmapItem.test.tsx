import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RoadmapItem from "@/components/RoadmapItem";
import { RoadmapItemsResponse } from "@/types/Responses";

jest.mock("date-fns", () => ({
  formatDistance: jest.fn(() => "2 days ago"),
}));

const baseItem: RoadmapItemsResponse = {
  id: "item-1",
  title: "Add dark mode",
  description: "Please add a dark mode toggle to the settings page.",
  category: "Frontend",
  status: "Planned",
  upvotes: 5,
  commentsCount: 2,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
  hasUpvoted: false,
};

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("RoadmapItem", () => {
  it("renders title, category, status, comment count and relative date", () => {
    render(<RoadmapItem {...baseItem} />);

    expect(screen.getByText("Add dark mode")).toBeInTheDocument();
    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getByText("Planned")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // commentsCount
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
  });

  it.each([
    ["Completed", "bg-green-100"],
    ["In Progress", "bg-blue-100"],
    ["Planned", "bg-yellow-100"],
    ["Cancelled", "bg-red-100"],
    ["Archived", "bg-gray-100"],
  ] as const)("colors the %s status badge correctly", (status, expectedClass) => {
    render(<RoadmapItem {...baseItem} status={status} />);
    expect(screen.getByText(status)).toHaveClass(expectedClass);
  });

  it("falls back to the default badge color for an unrecognized status", () => {
    render(<RoadmapItem {...baseItem} status={"Something Else" as RoadmapItemsResponse["status"]} />);
    expect(screen.getByText("Something Else")).toHaveClass("bg-gray-100");
  });

  it("shows the current upvote count", () => {
    render(<RoadmapItem {...baseItem} upvotes={5} hasUpvoted={false} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("optimistically increments the upvote count on click and keeps it on success", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<RoadmapItem {...baseItem} upvotes={5} hasUpvoted={false} />);

    const upvoteButton = screen.getByText("5").closest("button")!;
    await userEvent.click(upvoteButton);

    expect(await screen.findByText("6")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/api/upvote/item-1", {
      method: "PUT",
    });
  });

  it("reverts the optimistic upvote when the request fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    jest.spyOn(console, "error").mockImplementation(() => {});
    render(<RoadmapItem {...baseItem} upvotes={5} hasUpvoted={false} />);

    const upvoteButton = screen.getByText("5").closest("button")!;
    await userEvent.click(upvoteButton);

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  it("reverts the optimistic upvote when the request throws", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("network error"));
    jest.spyOn(console, "error").mockImplementation(() => {});
    render(<RoadmapItem {...baseItem} upvotes={5} hasUpvoted={false} />);

    const upvoteButton = screen.getByText("5").closest("button")!;
    await userEvent.click(upvoteButton);

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  it("decrements the count when un-upvoting an already-upvoted item", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<RoadmapItem {...baseItem} upvotes={5} hasUpvoted={true} />);

    const upvoteButton = screen.getByText("5").closest("button")!;
    await userEvent.click(upvoteButton);

    expect(await screen.findByText("4")).toBeInTheDocument();
  });

  it("renders the description as a link in grid view", () => {
    render(<RoadmapItem {...baseItem} view="grid" />);
    const description = screen.getByText(baseItem.description);
    expect(description.tagName).toBe("A");
    expect(description).toHaveAttribute("href", "/roadmap/item-1");
  });

  it("renders the description as a paragraph that toggles expansion in list view", async () => {
    render(<RoadmapItem {...baseItem} view="list" />);
    const description = screen.getByText(baseItem.description);
    expect(description.tagName).toBe("P");
    expect(description).toHaveClass("line-clamp-3");

    await userEvent.click(description);
    expect(description).toHaveClass("line-clamp-none");
  });

  it("renders the title as a non-link div and starts expanded on the detail page", () => {
    render(<RoadmapItem {...baseItem} detailPage />);
    const title = screen.getByText("Add dark mode");
    expect(title.closest("a")).toBeNull();

    const description = screen.getByText(baseItem.description);
    expect(description).toHaveClass("line-clamp-none");
  });

  it("renders the title as a link when not on the detail page", () => {
    render(<RoadmapItem {...baseItem} />);
    const title = screen.getByText("Add dark mode");
    expect(title.closest("a")).toHaveAttribute("href", "/roadmap/item-1");
  });
});
