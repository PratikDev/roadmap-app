import { render, screen } from "@testing-library/react";

import StatusOverviewCard from "../StatusOverview";

describe("StatusOverviewCard", () => {
  it("renders the title and value", () => {
    render(<StatusOverviewCard title="Planned" value={7} variant="planned" />);
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Planned")).toBeInTheDocument();
  });

  it.each([
    ["planned", "text-yellow-600"],
    ["in_progress", "text-blue-600"],
    ["completed", "text-green-600"],
    ["cancelled", "text-red-600"],
    ["archived", "text-gray-600"],
    ["total", "text-gray-800"],
  ] as const)("applies %s's color class", (variant, expectedClass) => {
    render(<StatusOverviewCard title="Label" value={1} variant={variant} />);
    expect(screen.getByText("Label")).toHaveClass(expectedClass);
  });
});
