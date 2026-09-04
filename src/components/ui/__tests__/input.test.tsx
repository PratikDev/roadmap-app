import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Input from "@/components/ui/input";

describe("Input", () => {
  it("renders with the base classes", () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText("Type here")).toHaveClass(
      "w-full",
      "rounded-md",
    );
  });

  it("merges a custom className with the base classes", () => {
    render(<Input placeholder="Type here" className="custom-class" />);
    const input = screen.getByPlaceholderText("Type here");
    expect(input).toHaveClass("custom-class");
    expect(input).toHaveClass("w-full");
  });

  it("passes through native input props and handles typing", async () => {
    const onChange = jest.fn();
    render(<Input placeholder="Type here" onChange={onChange} />);

    const input = screen.getByPlaceholderText("Type here");
    await userEvent.type(input, "hello");

    expect(input).toHaveValue("hello");
    expect(onChange).toHaveBeenCalledTimes(5);
  });

  it("respects a defaultValue", () => {
    render(<Input defaultValue="preset" placeholder="Type here" />);
    expect(screen.getByPlaceholderText("Type here")).toHaveValue("preset");
  });
});
