import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FilterSort from "../FilterSort";

const categories = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
];

describe("FilterSort", () => {
  it("prepends 'All Status' and 'All Categories' options", () => {
    render(
      <FilterSort
        statusFilter="all"
        categoryFilter="all"
        sortBy="newest"
        onChange={jest.fn()}
        categories={categories}
      />,
    );

    expect(
      screen.getByRole("option", { name: "All Status" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "All Categories" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Frontend" }),
    ).toBeInTheDocument();
  });

  it("associates each label with its select for accessibility", () => {
    render(
      <FilterSort
        statusFilter="all"
        categoryFilter="all"
        sortBy="newest"
        onChange={jest.fn()}
        categories={categories}
      />,
    );

    expect(screen.getByLabelText(/Status/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sort By/)).toBeInTheDocument();
  });

  it("reflects the controlled values in each select", () => {
    render(
      <FilterSort
        statusFilter="planned"
        categoryFilter="backend"
        sortBy="most_upvoted"
        onChange={jest.fn()}
        categories={categories}
      />,
    );

    expect(screen.getByLabelText(/Status/)).toHaveValue("planned");
    expect(screen.getByLabelText(/Category/)).toHaveValue("backend");
    expect(screen.getByLabelText(/Sort By/)).toHaveValue("most_upvoted");
  });

  it("calls onChange with 'status' and the new value when the status select changes", async () => {
    const onChange = jest.fn();
    render(
      <FilterSort
        statusFilter="all"
        categoryFilter="all"
        sortBy="newest"
        onChange={onChange}
        categories={categories}
      />,
    );

    await userEvent.selectOptions(screen.getByLabelText(/Status/), "Planned");
    expect(onChange).toHaveBeenCalledWith("status", "planned");
  });

  it("calls onChange with 'category' and the new value when the category select changes", async () => {
    const onChange = jest.fn();
    render(
      <FilterSort
        statusFilter="all"
        categoryFilter="all"
        sortBy="newest"
        onChange={onChange}
        categories={categories}
      />,
    );

    await userEvent.selectOptions(
      screen.getByLabelText(/Category/),
      "Backend",
    );
    expect(onChange).toHaveBeenCalledWith("category", "backend");
  });

  it("calls onChange with 'sortBy' and the new value when the sort select changes", async () => {
    const onChange = jest.fn();
    render(
      <FilterSort
        statusFilter="all"
        categoryFilter="all"
        sortBy="newest"
        onChange={onChange}
        categories={categories}
      />,
    );

    await userEvent.selectOptions(
      screen.getByLabelText(/Sort By/),
      "Oldest First",
    );
    expect(onChange).toHaveBeenCalledWith("sortBy", "oldest");
  });
});
