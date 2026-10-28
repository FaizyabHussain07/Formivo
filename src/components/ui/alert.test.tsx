import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "./alert";

describe("Alert", () => {
  it("uses role=alert for errors", () => {
    render(<Alert tone="error" title="Failed" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
  });

  it("uses role=status for non-error tones", () => {
    render(<Alert tone="success" title="Saved" />);
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
  });
});
