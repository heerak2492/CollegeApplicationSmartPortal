"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrefetchRoutes() {
  const router = useRouter();
  useEffect(() => {
    // warm up both portals so navigation is snappy
    router.prefetch("/student");
    router.prefetch("/faculty");
  }, [router]);
  return null;
}
