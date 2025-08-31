import { render, screen } from "./test-utils";
import { fireEvent, within } from "@testing-library/react";
import ApplicationFormComponent from "@/features/student/ApplicationForm";

beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe("ApplicationFormComponent (RTL + fireEvent)", () => {
  it("disables Save Draft and Preview until at least one Personal field is filled", () => {
    render(<ApplicationFormComponent />);

    const saveDraft = screen.getByRole("button", { name: /save draft/i });
    const preview = screen.getByRole("button", { name: /preview/i });

    expect(saveDraft).toBeDisabled();
    expect(preview).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "X" } });

    expect(saveDraft).not.toBeDisabled();
    expect(preview).not.toBeDisabled();
  });

  it("saves and resumes a draft from localStorage", async () => {
    const { unmount } = render(<ApplicationFormComponent />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Draft Person" } });
    fireEvent.click(screen.getByRole("button", { name: /save draft/i }));

    expect(await screen.findByText(/draft saved\./i)).toBeInTheDocument();
    unmount();
    render(<ApplicationFormComponent />);

    const resume = await screen.findByRole("button", { name: /resume draft/i });
    fireEvent.click(resume);

    expect((screen.getByLabelText(/full name/i) as HTMLInputElement).value).toBe("Draft Person");
  });

  it("Save Draft shows success snackbar", async () => {
    render(<ApplicationFormComponent />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "X" } });
    fireEvent.click(screen.getByRole("button", { name: /save draft/i }));

    expect(await screen.findByText(/draft saved\./i)).toBeInTheDocument();
  });
});
