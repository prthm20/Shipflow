import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";

export const generateTasks = inngest.createFunction(
  {
    id: "generate-tasks",
    name: "Generate Tasks from PRD",
    triggers: [{ event: "shipflow/prd.created" }],
  },
  async ({ event, step }) => {
    const { prdId, featureId } = event.data;

    const prd = await step.run("fetch-prd", async () => {
      return prisma.pRD.findUnique({ where: { id: prdId } });
    });

    if (!prd) throw new Error("PRD not found");

    const tasks = await step.run("generate-tasks-with-ai", async () => {
      const response = await fetch("https://aicredits.in/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4-6",
          max_tokens: 2000,
          messages: [
            {
              role: "system",
              content: `You are a senior software engineer. Break down a PRD into engineering tasks.
Return ONLY valid JSON array, no markdown, no explanation.`,
            },
            {
              role: "user",
              content: `Break this PRD into engineering tasks:

Problem: ${prd.problemStatement}
Goals: ${prd.goals.join(", ")}
Acceptance Criteria: ${prd.acceptanceCriteria.join(", ")}

Return JSON array:
[
  {
    "title": "task title",
    "description": "what needs to be done",
    "priority": "HIGH"
  }
]

Generate 5-8 tasks.`,
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.choices[0].message.content;
      const clean = text.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    });

    await step.run("save-tasks", async () => {
      await prisma.task.createMany({
        data: tasks.map((task: any, index: number) => ({
          title: task.title,
          description: task.description,
          priority: task.priority ?? "MEDIUM",
          status: "TODO",
          order: index,
          prdId,
        })),
      });

      await prisma.featureRequest.update({
        where: { id: featureId },
        data: { status: "TASKS_READY" },
      });
    });

    return { tasksCreated: tasks.length };
  }
);