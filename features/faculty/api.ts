export async function fetchApplications(): Promise<Response> {
  return await fetch("/api/applications", { method: "GET" });
}

export async function updateApplicationStatus(id: string, status: "Approved" | "Rejected") {
  const responseObject = await fetch(`/api/applications?id=${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!responseObject.ok) throw new Error("Failed to update");
  return await responseObject.json();
}
