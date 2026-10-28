import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Field } from "./field";
import { Input } from "./input";

describe("Field", () => {
  it("associates the label, helper text, and error with the control", () => {
    render(
      <Field label="Email" helperText="We never share it." error="Enter a valid email." required>
        {(control) => <Input type="email" {...control} />}
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: /Email/ });
    expect(input).toHaveAccessibleDescription("We never share it. Enter a valid email.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toBeRequired();
  });

  it("omits aria-invalid and describedby when there is nothing to describe", () => {
    render(<Field label="Name">{(control) => <Input {...control} />}</Field>);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });
});
