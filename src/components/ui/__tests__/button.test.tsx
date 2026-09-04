import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Button from "@/components/ui/button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("merges a custom className with the base classes", () => {
    render(<Button className="custom-class">Click me</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("bg-primary");
  });

  it("passes through native button props like disabled", async () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Click me
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
