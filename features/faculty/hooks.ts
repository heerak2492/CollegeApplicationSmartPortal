// features/faculty/hooks.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApplicationRecord, ReviewStatus } from "./types";

export function useApplicationsQuery() {
  return useQuery({
    queryKey: ["applications", "list"],
    queryFn: async (): Promise<ApplicationRecord[]> => {
      const res = await fetch("/api/applications", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load applications");
      return res.json();
    },
    staleTime: 10_000,
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReviewStatus }) => {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to update status");
      }
      return data.record as ApplicationRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", "list"] });
    },
  });
}
