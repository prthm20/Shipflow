"use client";

import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Zap } from "lucide-react";

const priorityColors = {
  LOW: "secondary",
  MEDIUM: "outline",
  HIGH: "default",
  CRITICAL: "destructive",
} as const;

const columns = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "DONE", label: "Done" },
];

export default function TasksPage() {
  const { orgSlug, projectId, featureId } = useParams<{
    orgSlug: string;
    projectId: string;
    featureId: string;
  }>();
  const router = useRouter();

  const { data: feature } = trpc.feature.getOne.useQuery({ featureId });
  const { data: tasks, refetch, isLoading } = trpc.task.getAll.useQuery(
    { prdId: feature?.prd?.id ?? "" },
    { enabled: !!feature?.prd?.id }
  );

  const generateTasks = trpc.task.generateFromPRD.useMutation({
    onSuccess: () => {
      setTimeout(() => refetch(), 3000);
    },
  });

  const updateStatus = trpc.task.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const tasksByStatus = (status: string) =>
    tasks?.filter((t) => t.status === status) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/${orgSlug}/projects/${projectId}/features/${featureId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Task Board</h1>
            <p className="text-muted-foreground text-sm">{feature?.title}</p>
          </div>
        </div>

        {feature?.prd && !tasks?.length && (
          <Button
            onClick={() => generateTasks.mutate({
              prdId: feature.prd!.id,
              featureId,
            })}
            disabled={generateTasks.isPending}
          >
            {generateTasks.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Generate Tasks with AI
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <div key={col.id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-sm">{col.label}</h2>
                <Badge variant="secondary">{tasksByStatus(col.id).length}</Badge>
              </div>

              <div className="flex flex-col gap-2 min-h-32 p-2 bg-secondary/30 rounded-lg">
                {tasksByStatus(col.id).map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-sm">{task.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                        <div className="flex gap-1">
                          {col.id !== "TODO" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs px-2"
                              onClick={() => updateStatus.mutate({
                                taskId: task.id,
                                status: col.id === "IN_PROGRESS" ? "TODO" : "IN_PROGRESS",
                              })}
                            >
                              ←
                            </Button>
                          )}
                          {col.id !== "DONE" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs px-2"
                              onClick={() => updateStatus.mutate({
                                taskId: task.id,
                                status: col.id === "TODO" ? "IN_PROGRESS" : "DONE",
                              })}
                            >
                              →
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {tasksByStatus(col.id).length === 0 && (
                  <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {generateTasks.isPending && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating tasks with AI...
        </div>
      )}
    </div>
  );
}