"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquarePlus } from "lucide-react";

export default function ProjectPage() {
  const { orgSlug, projectId } = useParams<{ orgSlug: string; projectId: string }>();
  const router = useRouter();
  const { data: project } = trpc.project.getOne.useQuery({ projectId });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project?.name ?? "Project"}</h1>
          <p className="text-muted-foreground">{project?.description}</p>
        </div>
        <Button onClick={() => router.push(`/${orgSlug}/projects/${projectId}/features`)}>
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          View Features
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/${orgSlug}/projects/${projectId}/features`)}
        >
          <CardHeader>
            <CardTitle className="text-base">Feature Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{project?.features?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground">Total features</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}