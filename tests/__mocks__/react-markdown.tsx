import * as React from "react";

type Props = {
  children?: React.ReactNode;
};

// Minimal mock: just render children as-is inside a div
export default function ReactMarkdown({ children }: Props) {
  return <div data-testid="react-markdown">{children}</div>;
}
