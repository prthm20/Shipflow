"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Bot, GitPullRequest, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function ReviewPage() {
  const { orgSlug, projectId, featureId } = useParams<{
    orgSlug: string;
    projectId: string;
    featureId: string;
  }>();
  const router = useRouter();

  const [prNumber, setPrNumber] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [prBranch, setPrBranch] = useState("");
  const [prUrl, setPrUrl] = useState("");

  const { data: feature } = trpc.feature.getOne.useQuery({ featureId });
  const { data: reviews, refetch } = trpc.review.getReviews.useQuery({ featureId });
  const { data: prs } = trpc.github.listPRs.useQuery({ projectId });

  const linkPR = trpc.github.linkPRToFeature.useMutation({
    onSuccess: () => refetch(),
  });

  const runReview = trpc.review.runAIReview.useMutation({
    onSuccess: () => refetch(),
  });

  const handleLinkPR = () => {
    linkPR.mutate({
      featureId,
      projectId,
      prNumber: parseInt(prNumber),
      title: prTitle,
      branch: prBranch,
      url: prUrl,
    });
  };

  const handleSelectPR = (pr: any) => {
    setPrNumber(pr.number.toString());
    setPrTitle(pr.title);
    setPrBranch(pr.branch);
    setPrUrl(pr.url);
  };

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
          <h1 className="text-2xl font-bold">AI Code Review</h1>
          <p className="text-muted-foreground text-sm">{feature?.title}</p>
        </div>
      </div>

      {!feature?.pullRequest ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitPullRequest className="h-4 w-4" />
              Link a Pull Request
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {prs?.length ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Select from open PRs</p>
                {prs.map((pr) => (
                  <div
                    key={pr.number}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-secondary transition-colors ${
                      prNumber === pr.number.toString() ? "border-primary bg-secondary" : ""
                    }`}
                    onClick={() => handleSelectPR(pr)}
                  >
                    <p className="text-sm font-medium">#{pr.number} {pr.title}</p>
                    <p className="text-xs text-muted-foreground">{pr.branch}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">PR Number</label>
                  <Input
                    placeholder="e.g. 42"
                    value={prNumber}
                    onChange={(e) => setPrNumber(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">PR Title</label>
                  <Input
                    placeholder="e.g. feat: add dark mode"
                    value={prTitle}
                    onChange={(e) => setPrTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Branch</label>
                  <Input
                    placeholder="e.g. feat/dark-mode"
                    value={prBranch}
                    onChange={(e) => setPrBranch(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">PR URL</label>
                  <Input
                    placeholder="https://github.com/..."
                    value={prUrl}
                    onChange={(e) => setPrUrl(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleLinkPR}
              disabled={linkPR.isPending || !prNumber}
            >
              {linkPR.isPending ? "Linking..." : "Link PR"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">
                  #{feature.pullRequest.prNumber} {feature.pullRequest.title}
                </p>
                <Badge variant="outline">{feature.pullRequest.branch}</Badge>
              </div>
              <Button
                onClick={() => runReview.mutate({ featureId, projectId })}
                disabled={runReview.isPending}
              >
                {runReview.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Reviewing...</>
                ) : (
                  <><Bot className="h-4 w-4 mr-2" />Run AI Review</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {reviews && reviews.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Review History</h2>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {review.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <CardTitle className="text-base">
                      {review.passed ? "Review Passed" : "Changes Required"}
                    </CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{review.summary}</p>
                {review.issues.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Issues Found ({review.issues.length})</p>
                    {review.issues.map((issue) => (
                      <div
                        key={issue.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          issue.severity === "BLOCKING"
                            ? "border-l-red-500 bg-red-50 dark:bg-red-950"
                            : "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={issue.severity === "BLOCKING" ? "destructive" : "outline"}
                          >
                            {issue.severity}
                          </Badge>
                          <p className="text-sm font-medium">{issue.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{issue.description}</p>
                        {issue.filePath && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono">
                            {issue.filePath}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}