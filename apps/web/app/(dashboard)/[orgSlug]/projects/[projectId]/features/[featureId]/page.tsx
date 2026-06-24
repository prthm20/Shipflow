"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bot , Zap,GitPullRequest,CheckCircle } from "lucide-react";


export default function FeatureDetailPage() {
  const { orgSlug, projectId, featureId } = useParams<{
    orgSlug: string;
    projectId: string;
    featureId: string;
  }>();
  const router = useRouter();

  const { data: feature } = trpc.feature.getOne.useQuery({ featureId });

  if (!feature) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push(`/${orgSlug}/projects/${projectId}/features`)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to features
      </Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{feature.title}</h1>
        <Badge>{feature.status.replace(/_/g, " ")}</Badge>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Feature Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </CardContent>
      </Card>

      {feature.prd && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Generated PRD
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Problem Statement</p>
              <p className="text-sm text-muted-foreground">{feature.prd.problemStatement}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Goals</p>
              <ul className="list-disc list-inside">
                {feature.prd.goals.map((g, i) => (
                  <li key={i} className="text-sm text-muted-foreground">{g}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Non-Goals</p>
              <ul className="list-disc list-inside">
                {feature.prd.nonGoals.map((g, i) => (
                  <li key={i} className="text-sm text-muted-foreground">{g}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Acceptance Criteria</p>
              <ul className="list-disc list-inside">
                {feature.prd.acceptanceCriteria.map((c, i) => (
                  <li key={i} className="text-sm text-muted-foreground">{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Edge Cases</p>
              <ul className="list-disc list-inside">
                {feature.prd.edgeCases.map((e, i) => (
                  <li key={i} className="text-sm text-muted-foreground">{e}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Success Metrics</p>
              <ul className="list-disc list-inside">
                {feature.prd.successMetrics.map((m, i) => (
                  <li key={i} className="text-sm text-muted-foreground">{m}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {feature.prd && (
        <div className="flex flex-col gap-2">
  <Button
    onClick={() => router.push(`/${orgSlug}/projects/${projectId}/features/${featureId}/tasks`)}
    className="w-full"
  >
    <Zap className="h-4 w-4 mr-2" />
    View Task Board
  </Button>
  <Button
      variant="outline"
      onClick={() => router.push(`/${orgSlug}/projects/${projectId}/features/${featureId}/review`)}
      className="w-full"
    >
      <GitPullRequest className="h-4 w-4 mr-2" />
      AI Code Review
    </Button>

    <Button
  variant="secondary"
  onClick={() => router.push(`/${orgSlug}/projects/${projectId}/features/${featureId}/approval`)}
  className="w-full"
>
  <CheckCircle className="h-4 w-4 mr-2" />
  Human Approval
</Button>
  </div>
  
)}
    </div>
  );
}