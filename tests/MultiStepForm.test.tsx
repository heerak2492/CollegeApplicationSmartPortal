import { render, screen, fireEvent } from "@testing-library/react";
import ApplicationFormComponent from "@/features/student/ApplicationForm";

jest.spyOn(global, "crypto", "get").mockReturnValue({
  randomUUID: () => "uuid"
} as any);

describe("ApplicationFormComponent", () => {
  it("shows validation errors on empty submit", async () => {
    render(<ApplicationFormComponent />);
    const nextButton = screen.getByRole("button", { name: /next/i });
    fireEvent.click(nextButton);
    expect(await screen.findByText(/Full name is required/i)).toBeInTheDocument();
  });
});
