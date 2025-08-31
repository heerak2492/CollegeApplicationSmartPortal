import { render, screen } from "@testing-library/react";
import ApplicationsTable from "@/features/faculty/ApplicationsTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

describe("ApplicationsTable", () => {
  it("renders table with loading state", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ApplicationsTable />
      </QueryClientProvider>
    );
    expect(screen.getByText(/applications/i)).toBeInTheDocument();
  });
});
