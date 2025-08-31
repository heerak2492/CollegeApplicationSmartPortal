import { render, screen, fireEvent, within } from "../tests/test-utils";
import ChatAssistant from "@/features/student/ChatAssistant";

const typeInComposer = (text: string) => {
  const composer = screen.getByPlaceholderText(/ask the assistant/i);
  fireEvent.change(composer, { target: { value: text } });
  return composer;
};

describe("ChatAssistant (fireEvent version)", () => {
  let origCreateElement: typeof document.createElement;

  beforeEach(() => {
    window.localStorage.clear();
    jest.useFakeTimers();

    jest.spyOn(window.localStorage.__proto__, "setItem");
    (global as any).URL.createObjectURL = jest.fn(() => "blob:mock");
    (global as any).URL.revokeObjectURL = jest.fn();

    origCreateElement = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation(((tagName: string, ...args: any[]) => {
      if (tagName === "a") {
        return {
          href: "",
          download: "",
          click: jest.fn(),
          setAttribute: jest.fn(),
        } as unknown as HTMLAnchorElement;
      }
      return origCreateElement(tagName as any, ...args);
    }) as any);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("renders header and disabled send initially", () => {
    render(<ChatAssistant />);
    expect(screen.getByText(/chat assistant/i)).toBeInTheDocument();
    const send = screen.getByRole("button", { name: /send message/i });
    expect(send).toBeDisabled();
  });

  it("sends a message via button and shows assistant reply (onAsk provided)", async () => {
    const onAsk = jest.fn(async (prompt: string) => `**Echo:** ${prompt}`);
    render(<ChatAssistant onAsk={onAsk} />);

    typeInComposer("Hello world");
    const send = screen.getByRole("button", { name: /send message/i });
    expect(send).toBeEnabled();
    fireEvent.click(send);

    expect(await screen.findByText("Hello world")).toBeInTheDocument();
    expect(await screen.findByText(/\*\*Echo:\*\* Hello world/)).toBeInTheDocument();

    jest.advanceTimersByTime(300);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it("sends when pressing Enter (no Shift)", async () => {
    const onAsk = jest.fn(async () => "ok");
    render(<ChatAssistant onAsk={onAsk} />);

    const composer = typeInComposer("Enter to send");
    fireEvent.keyDown(composer, { key: "Enter" });
    expect(await screen.findByText(/Enter to send/)).toBeInTheDocument();
    expect(await screen.findByText("ok")).toBeInTheDocument();
  });

  it("shows typing indicator while waiting", async () => {
    const onAsk = jest.fn(
      () =>
        new Promise<string>((resolve) => {
          setTimeout(() => resolve("done"), 800);
        }),
    );
    render(<ChatAssistant onAsk={onAsk} />);

    typeInComposer("slow");
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.getByLabelText(/assistant is typing/i)).toBeInTheDocument();

    jest.advanceTimersByTime(900);
    expect(await screen.findByText("done")).toBeInTheDocument();

    expect(screen.queryByLabelText(/assistant is typing/i)).not.toBeInTheDocument();
  });

  it("clears chat with the Clear chat button", async () => {
    const onAsk = jest.fn(async () => "answer");
    render(<ChatAssistant onAsk={onAsk} />);

    typeInComposer("hi");
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByText("hi")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear chat/i }));
    expect(screen.queryByText("hi")).not.toBeInTheDocument();
    expect(screen.queryByText("answer")).not.toBeInTheDocument();
  });

  it("deletes a single message via the per-message delete icon", async () => {
    const onAsk = jest.fn(async () => "assistant here");
    render(<ChatAssistant onAsk={onAsk} />);

    typeInComposer("remove me");
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    const msg = await screen.findByText("remove me");
    const delButtons = screen.getAllByRole("button", { name: /delete message/i });
    fireEvent.click(delButtons[0]);

    expect(msg).not.toBeInTheDocument();
  });

  it("exports current session as JSON", () => {
    render(<ChatAssistant />);
    fireEvent.click(screen.getByRole("button", { name: /export as json/i }));
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});
