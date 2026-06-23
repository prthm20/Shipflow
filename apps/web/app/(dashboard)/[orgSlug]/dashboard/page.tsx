"use client";

import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";

export default function DashboardPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { data: org } = trpc.organization.getCurrent.useQuery({ slug: orgSlug });
  const { data: health } = trpc.healthcheck.useQuery();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        {org?.name ?? "Dashboard"}
      </h1>
      <p className="text-muted-foreground">
        Welcome to ShipFlow AI — {orgSlug}
      </p>
      <div className="mt-4 p-4 border rounded-lg w-fit">
        <p className="text-sm font-medium">API Status:</p>
        <p className="text-sm text-green-500">
          {health?.status} — {health?.timestamp}
        </p>
      </div>
    </div>
  );
}