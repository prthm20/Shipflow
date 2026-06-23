"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MessageSquarePlus } from "lucide-react";

const statusColors: Record<string, "secondary" | "outline" | "default" | "destructive"> = {
  DRAFT: "secondary",
  CLARIFYING: "outline",
  PRD_GENERATING: "outline",
  PRD_READY: "default",
  TASKS_READY: "default",
  IN_DEVELOPMENT: "default",
  IN_REVIEW: "default",
  FIX_NEEDED: "destructive",
  PENDING_APPROVAL: "outline",
  APPROVED: "default",
  SHIPPED: "default",
  REJECTED: "destructive",
};

export default function FeaturesPage() {
  const { orgSlug, projectId } = useParams<{ orgSlug: string; projectId: string }>();
  const router = useRouter();

  const { data: features } = trpc.feature.getAll.useQuery({ projectId });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Feature Requests</h1>
          <p className="text-muted-foreground">Track features from idea to production</p>
        </div>
        <Button onClick={() => router.push(`/${orgSlug}/projects/${projectId}/features/new`)}>
          <Plus className="h-4 w-4 mr-2" />
          New Feature
        </Button>
      </div>

      {!features?.length ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg border-dashed">
          <MessageSquarePlus className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No feature requests yet</p>
          <p className="text-sm text-muted-foreground">Submit your first feature request</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {features.map((feature) => (
            <Card
              key={feature.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/${orgSlug}/projects/${projectId}/features/${feature.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <Badge variant={statusColors[feature.status]}>
                    {feature.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {feature.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  by {feature.author.name} · {new Date(feature.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}