// features/faculty/ApplicationsTable.tsx
"use client";
import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Toolbar,
  Typography,
  Stack,
  Chip,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import type { ApplicationRecord } from "./types";
import { useApplicationsQuery, useUpdateApplicationStatus } from "./hooks";
import FacultySearchBar from "./FacultySearchBar";

type Order = "asc" | "desc";

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilized = array.map((el, index) => [el, index] as [T, number]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === "desc"
    ? (a, b) => ((b[orderBy] as any) < (a[orderBy] as any) ? -1 : 1)
    : (a, b) => ((a[orderBy] as any) < (b[orderBy] as any) ? -1 : 1);
}

export default function ApplicationsTable() {
  const { data, isLoading, isError } = useApplicationsQuery();
  const updateMutation = useUpdateApplicationStatus();

  const [pageIndex, setPageIndex] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof ApplicationRecord>("applicantFullName");
  const [filterText, setFilterText] = React.useState("");

  // Track which rows are updating so only those buttons disable
  const [pendingRowIds, setPendingRowIds] = React.useState<Set<string>>(new Set());

  const handleRequestSort = (property: keyof ApplicationRecord) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filtered = (data || []).filter((r) =>
    (r.applicantFullName + " " + r.intendedProgram + " " + r.status)
      .toLowerCase()
      .includes(filterText.toLowerCase()),
  );

  const sorted = stableSort(filtered, getComparator(order, orderBy));
  const paged = sorted.slice(pageIndex * rowsPerPage, pageIndex * rowsPerPage + rowsPerPage);

  const setRowPending = (id: string, pending: boolean) =>
    setPendingRowIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });

  const handleUpdateStatus = async (id: string, status: "Approved" | "Rejected") => {
    if (pendingRowIds.has(id)) return;
    setRowPending(id, true);
    try {
      await updateMutation.mutateAsync({ id, status });
    } finally {
      setRowPending(id, false);
    }
  };

  return (
    <Paper variant="outlined">
      <Toolbar sx={{ gap: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Applications
        </Typography>

        {/* Right-aligned, fixed-width search (doesn't occupy full width) */}
        <Box
          sx={{
            width: { xs: 220, sm: 260, md: 300 },
            flexShrink: 0,
          }}
        >
          <FacultySearchBar
            searchQueryText={filterText}
            onSearchQueryTextChange={(v) => {
              setFilterText(v);
              setPageIndex(0);
            }}
            onSearchSubmit={() => setPageIndex(0)}
            autoFocus={false}
            placeholderText="Search applications…"
          />
        </Box>
      </Toolbar>

      <TableContainer>
        <Table size="small" aria-label="applications table">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === "applicantFullName" ? order : false}>
                <TableSortLabel
                  active={orderBy === "applicantFullName"}
                  direction={orderBy === "applicantFullName" ? order : "asc"}
                  onClick={() => handleRequestSort("applicantFullName")}
                >
                  Applicant
                </TableSortLabel>
              </TableCell>
              <TableCell>Program</TableCell>
              <TableCell sortDirection={orderBy === "submittedAtIso" ? order : false}>
                <TableSortLabel
                  active={orderBy === "submittedAtIso"}
                  direction={orderBy === "submittedAtIso" ? order : "asc"}
                  onClick={() => handleRequestSort("submittedAtIso")}
                >
                  Submitted At
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5}>Loading…</TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={5}>Failed to load.</TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>No results.</TableCell>
              </TableRow>
            )}

            {paged.map((row) => {
              const isRowPending = pendingRowIds.has(JSON.stringify(row?.id));
              return (
                <TableRow key={row.id} hover>
                  <TableCell>{row.applicantFullName}</TableCell>
                  <TableCell>{row.intendedProgram}</TableCell>
                  <TableCell>{new Date(row.submittedAtIso).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.status}
                      color={
                        row.status === "Approved"
                          ? "success"
                          : row.status === "Rejected"
                            ? "error"
                            : "default"
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" gap={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={row.status === "Approved" || isRowPending}
                        onClick={() => handleUpdateStatus(JSON.stringify(row?.id), "Approved")}
                        startIcon={isRowPending ? <CircularProgress size={14} /> : undefined}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        disabled={row.status === "Rejected" || isRowPending}
                        onClick={() => handleUpdateStatus(JSON.stringify(row?.id), "Rejected")}
                        startIcon={isRowPending ? <CircularProgress size={14} /> : undefined}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={sorted.length}
        page={pageIndex}
        onPageChange={(_, p) => setPageIndex(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPageIndex(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
}
