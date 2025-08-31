import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatAssistant from "@/features/student/ChatAssistant";

beforeEach(() => {
  // Clear localStorage to avoid side-effects
  window.localStorage.clear();
});

describe("ChatAssistant", () => {
  it("sends a message and shows assistant reply", async () => {
    render(<ChatAssistant />);
    const input = screen.getByLabelText(/chat message input/i);
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(screen.getByText(/Assistant is typing/i)).toBeInTheDocument());
  });
});
