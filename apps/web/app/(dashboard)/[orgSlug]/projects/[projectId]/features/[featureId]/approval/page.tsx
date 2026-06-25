"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Bot,
  GitPullRequest,
  CheckSquare,
  Zap,
} from "lucide-react";

export default function ApprovalPage() {
  const { orgSlug, projectId, featureId } = useParams<{
    orgSlug: string;
    projectId: string;
    featureId: string;
  }>();
  const router = useRouter();
  const [notes, setNotes] = useState("");

  const { data: feature } = trpc.feature.getOne.useQuery({ featureId });
  const { data: reviews } = trpc.review.getReviews.useQuery({ featureId });
  const { data: tasks } = trpc.task.getAll.useQuery(
    { prdId: feature?.prd?.id ?? "" },
    { enabled: !!feature?.prd?.id }
  );
  const { data: approval, refetch } = trpc.approval.getApproval.useQuery({ featureId });

  const approve = trpc.approval.approve.useMutation({
    onSuccess: () => {
      refetch();
      router.push(`/${orgSlug}/projects/${projectId}/features`);
    },
  });

  const reject = trpc.approval.reject.useMutation({
    onSuccess: () => {
      refetch();
      router.push(`/${orgSlug}/projects/${projectId}/features`);
    },
  });

  const latestReview = reviews?.[0];
  const passedReview = latestReview?.passed;
  const doneTasks = tasks?.filter((t: { status: string }) => t.status === "DONE").length ?? 0;
  const totalTasks = tasks?.length ?? 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/${orgSlug}/projects/${projectId}/features/${featureId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Human Approval</h1>
          <p className="text-muted-foreground text-sm">{feature?.title}</p>
        </div>
      </div>

      {approval ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {approval.decision === "APPROVED" ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <p className="font-semibold text-lg">
                  {approval.decision === "APPROVED" ? "Feature Shipped! 🎉" : "Feature Rejected"}
                </p>
                <p className="text-sm text-muted-foreground">
                  by {approval.reviewer.name} · {new Date(approval.createdAt).toLocaleString()}
                </p>
                {approval.notes && (
                  <p className="text-sm mt-2">{approval.notes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">PRD</p>
                </div>
                <Badge variant={feature?.prd ? "default" : "secondary"}>
                  {feature?.prd ? "Generated" : "Missing"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Tasks</p>
                </div>
                <p className="text-2xl font-bold">{doneTasks}/{totalTasks}</p>
                <p className="text-xs text-muted-foreground">completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">AI Review</p>
                </div>
                <Badge variant={passedReview ? "default" : "destructive"}>
                  {latestReview ? (passedReview ? "Passed" : "Failed") : "Not run"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {latestReview && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Latest AI Review Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{latestReview.summary}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline">
                    {latestReview.issues.filter((i) => i.severity === "BLOCKING").length} blocking
                  </Badge>
                  <Badge variant="outline">
                    {latestReview.issues.filter((i) => i.severity === "NON_BLOCKING").length} non-blocking
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {feature?.pullRequest && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Pull Request</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      #{feature.pullRequest.prNumber} {feature.pullRequest.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{feature.pullRequest.branch}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(feature.pullRequest!.url, "_blank")}
                  >
                    View PR
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Final Decision
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Notes (optional for approve, required for reject)</label>
                <Textarea
                  placeholder="Add any notes about your decision..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => approve.mutate({ featureId, notes })}
                  disabled={approve.isPending || reject.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {approve.isPending ? "Approving..." : "Approve & Ship"}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => reject.mutate({ featureId, notes })}
                  disabled={approve.isPending || reject.isPending || !notes}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {reject.isPending ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}