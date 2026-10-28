import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { Dialog } from "./dialog";

beforeAll(() => {
  // jsdom does not implement the modal dialog API.
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

describe("Dialog", () => {
  it("is labelled by its title and described by its description", () => {
    render(
      <Dialog open onClose={() => {}} title="Delete form" description="This cannot be undone." />,
    );
    const dialog = screen.getByRole("dialog", { name: "Delete form" });
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
  });

  it("calls onClose when the close button is pressed", async () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="Delete form" />);
    await userEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
