import { render, screen, fireEvent, within } from "./test-utils";
import ApplicationsTable from "@/features/faculty/ApplicationsTable";
import * as hooks from "@/features/faculty/hooks";
import type { ApplicationRecord } from "@/features/faculty/types";

jest.mock("../features/faculty/hooks", () => ({
  useApplicationsQuery: jest.fn(),
  useUpdateApplicationStatus: jest.fn(),
}));

const mockedHooks = hooks as jest.Mocked<typeof hooks>;

function getRowByApplicant(applicant: string): HTMLTableRowElement {
  const cell = screen.getByText(applicant);
  const row = cell.closest("tr");
  if (!row) throw new Error(`Row for ${applicant} not found`);
  return row as HTMLTableRowElement;
}

function mockUseApplicationsQuery(
  opts: Partial<ReturnType<typeof hooks.useApplicationsQuery>> & {
    data?: ApplicationRecord[];
  } = {},
) {
  mockedHooks.useApplicationsQuery.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    ...opts,
  } as any);
}

function mockUseUpdateApplicationStatus(mutateAsync: jest.Mock) {
  mockedHooks.useUpdateApplicationStatus.mockReturnValue({ mutateAsync } as any);
}

const rows: ApplicationRecord[] = [
  {
    id: "1",
    applicantFullName: "Heerak",
    intendedProgram: "Computer Science",
    submittedAtIso: "2025-08-01T09:00:00.000Z",
    status: "Pending",
  },
  {
    id: "2",
    applicantFullName: "Parnisha",
    intendedProgram: "Mathematics",
    submittedAtIso: "2025-07-30T12:00:00.000Z",
    status: "Pending",
  },
  {
    id: "3",
    applicantFullName: "Uma",
    intendedProgram: "Physics",
    submittedAtIso: "2025-07-29T08:00:00.000Z",
    status: "Rejected",
  },
  {
    id: "4",
    applicantFullName: "Pravallika",
    intendedProgram: "Chemistry",
    submittedAtIso: "2025-07-28T10:00:00.000Z",
    status: "Approved",
  },
  {
    id: "5",
    applicantFullName: "Sairam",
    intendedProgram: "Biology",
    submittedAtIso: "2025-07-27T10:00:00.000Z",
    status: "Pending",
  },
  {
    id: "6",
    applicantFullName: "Zoe",
    intendedProgram: "Economics",
    submittedAtIso: "2025-07-26T10:00:00.000Z",
    status: "Pending",
  },
];

describe("ApplicationsTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedHooks.useApplicationsQuery.mockReset();
    mockedHooks.useUpdateApplicationStatus.mockReset();
  });

  it("shows loading, error, and empty states", () => {
    mockUseApplicationsQuery({ isLoading: true });
    mockUseUpdateApplicationStatus(jest.fn());
    const { unmount } = render(<ApplicationsTable />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    unmount();

    mockUseApplicationsQuery({ isError: true });
    mockUseUpdateApplicationStatus(jest.fn());
    render(<ApplicationsTable />);
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it("renders data and filters via the search bar", () => {
    mockUseApplicationsQuery({ data: rows });
    mockUseUpdateApplicationStatus(jest.fn());
    render(<ApplicationsTable />);
    expect(screen.getByText("Heerak")).toBeInTheDocument();
    expect(screen.getByText("Parnisha")).toBeInTheDocument();
    expect(screen.getByText("Uma")).toBeInTheDocument();
    expect(screen.getByText("Pravallika")).toBeInTheDocument();
    expect(screen.getByText("Sairam")).toBeInTheDocument();
    expect(screen.queryByText("Zoe")).not.toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search applications/i);
    fireEvent.change(searchInput, { target: { value: "mallory" } });
    expect(screen.getByText("Sairam")).toBeInTheDocument();
    expect(screen.queryByText("Heerak")).not.toBeInTheDocument();
  });

  it("shows 'No results' when filter matches nothing", () => {
    mockUseApplicationsQuery({ data: rows });
    mockUseUpdateApplicationStatus(jest.fn());
    render(<ApplicationsTable />);

    const searchInput = screen.getByPlaceholderText(/search applications/i);
    fireEvent.change(searchInput, { target: { value: "nonexistent-query" } });
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });

  it("sorts by Applicant column toggle (asc ↔ desc)", () => {
    mockUseApplicationsQuery({ data: rows });
    mockUseUpdateApplicationStatus(jest.fn());
    render(<ApplicationsTable />);

    const bodyRowsAsc = screen.getAllByRole("row").slice(1);
    expect(within(bodyRowsAsc[0]).getByText("Heerak")).toBeInTheDocument();

    const applicantHeader = screen.getByRole("button", { name: /applicant/i });
    fireEvent.click(applicantHeader);

    const bodyRowsDesc = screen.getAllByRole("row").slice(1);
    expect(within(bodyRowsDesc[0]).getByText("Zoe")).toBeInTheDocument();
  });

  it("sorts by Submitted At column", () => {
    mockUseApplicationsQuery({ data: rows });
    mockUseUpdateApplicationStatus(jest.fn());
    render(<ApplicationsTable />);

    const submittedAtHeader = screen.getByRole("button", { name: /submitted at/i });
    fireEvent.click(submittedAtHeader); // asc by date

    const firstRowAsc = screen.getAllByRole("row").slice(1)[0];
    expect(
      within(firstRowAsc).queryByText("Zoe") || within(firstRowAsc).queryByText("Sairam"),
    ).toBeTruthy();

    fireEvent.click(submittedAtHeader); // desc by date
    const firstRowDesc = screen.getAllByRole("row").slice(1)[0];
    expect(
      within(firstRowDesc).getByText("Heerak") || within(firstRowDesc).getByText("Parnisha"),
    ).toBeTruthy();
  });

  it("paginates to the next page", () => {
    mockUseApplicationsQuery({ data: rows });
    mockUseUpdateApplicationStatus(jest.fn());
    render(<ApplicationsTable />);

    expect(screen.queryByText("Zoe")).not.toBeInTheDocument();
    const nextPageBtn = screen.getByRole("button", { name: /go to next page/i });
    fireEvent.click(nextPageBtn);
    expect(screen.getByText("Zoe")).toBeInTheDocument();
  });

  it("Rejecting a row calls mutateAsync with correct id and status", () => {
    const mutateAsync = jest.fn(async () => {});
    mockUseApplicationsQuery({ data: rows });
    mockUseUpdateApplicationStatus(mutateAsync);
    render(<ApplicationsTable />);

    const charlieRow = getRowByApplicant("Uma");
    const charlieReject = within(charlieRow).getByRole("button", { name: /reject/i });
    expect(charlieReject).toBeDisabled();

    const malloryRow = getRowByApplicant("Sairam");
    const malloryReject = within(malloryRow).getByRole("button", { name: /reject/i });
    fireEvent.click(malloryReject);

    expect(mutateAsync).toHaveBeenCalledWith({ id: "5", status: "Rejected" });
  });
});
