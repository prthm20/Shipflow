"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GitBranch, GitPullRequest, Link, CheckCircle } from "lucide-react";

export default function GitHubPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const [repoOwner, setRepoOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const { data: integration, refetch } = trpc.github.getIntegration.useQuery({ projectId });
  const { data: prs } = trpc.github.listPRs.useQuery(
    { projectId },
    { enabled: !!integration }
  );

  const connectRepo = trpc.github.connectRepo.useMutation({
    onSuccess: () => {
      refetch();
      setAccessToken("");
    },
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <GitBranch className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">GitHub Integration</h1>
          <p className="text-muted-foreground">Connect your repository to track pull requests</p>
        </div>
      </div>

      {!integration ? (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">Connect a repository</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Repository owner</label>
              <Input
                placeholder="e.g. prthm20"
                value={repoOwner}
                onChange={(e) => setRepoOwner(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Repository name</label>
              <Input
                placeholder="e.g. Shipflow"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">GitHub access token</label>
              <Input
                type="password"
                placeholder="ghp_..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Generate a token at github.com/settings/tokens with repo scope
              </p>
            </div>
            {connectRepo.error && (
              <p className="text-sm text-red-500">{connectRepo.error.message}</p>
            )}
            <Button
              onClick={() => connectRepo.mutate({ projectId, repoOwner, repoName, accessToken })}
              disabled={connectRepo.isPending || !repoOwner || !repoName || !accessToken}
            >
              {connectRepo.isPending ? "Connecting..." : "Connect Repository"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Connected Repository
                </CardTitle>
                <Badge variant="default">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
               <a 
                  href={`https://github.com/${integration.repoFullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline"
                >
                  {integration.repoFullName}
                </a>
                <Link className="h-3 w-3 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <GitPullRequest className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Open Pull Requests</h2>
              <Badge variant="secondary">{prs?.length ?? 0}</Badge>
            </div>

            {!prs?.length ? (
              <div className="flex flex-col items-center justify-center h-32 border rounded-lg border-dashed">
                <p className="text-muted-foreground text-sm">No open pull requests</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {prs.map((pr) => (
                  <Card key={pr.number}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">#{pr.number} {pr.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {pr.branch} · by {pr.user} · {new Date(pr.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{pr.state}</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(pr.url, "_blank")}
                          >
                            View on GitHub
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}