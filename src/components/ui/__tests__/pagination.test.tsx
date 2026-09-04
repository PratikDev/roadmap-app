import { render, screen } from "@testing-library/react";

import Pagination from "@/components/ui/pagination";

describe("Pagination", () => {
  it("hides the Previous link on the first page", () => {
    render(<Pagination totalPages={5} currentPage={1} />);
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("hides the Next link on the last page", () => {
    render(<Pagination totalPages={5} currentPage={5} />);
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
  });

  it("shows both Previous and Next on a middle page", () => {
    render(<Pagination totalPages={5} currentPage={3} />);
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("renders a link for every page", () => {
    render(<Pagination totalPages={4} currentPage={1} />);
    for (const page of [1, 2, 3, 4]) {
      expect(
        screen.getByRole("link", { name: String(page) }),
      ).toBeInTheDocument();
    }
  });

  it("points each page link to the correct ?page= href", () => {
    render(<Pagination totalPages={3} currentPage={1} />);
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "href",
      "?page=2",
    );
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "?page=2",
    );
  });

  it("visually marks the current page as active", () => {
    render(<Pagination totalPages={3} currentPage={2} />);
    const current = screen.getByRole("link", { name: "2" });
    const other = screen.getByRole("link", { name: "1" });

    expect(current.className).toEqual(expect.stringContaining("font-bold"));
    expect(other.className).not.toEqual(expect.stringContaining("font-bold"));
  });
});
