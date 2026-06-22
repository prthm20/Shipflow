"use client";

import { trpc } from "@/lib/trpc";

export default function DashboardPage() {
  const { data, isLoading } = trpc.healthcheck.useQuery();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to ShipFlow AI</p>
      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm font-medium">API Status:</p>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Checking...</p>
        ) : (
          <p className="text-sm text-green-500">
            {data?.status} — {data?.timestamp}
          </p>
        )}
      </div>
    </div>
  );
}