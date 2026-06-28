import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/lib/inngest";

export const taskRouter = createTRPCRouter({
  generateFromPRD: protectedProcedure
  .input(z.object({ prdId: z.string(), featureId: z.string() }))
  .mutation(async ({ input }) => {
    const prd = await prisma.pRD.findUnique({
      where: { id: input.prdId },
    });

    if (!prd) throw new Error("PRD not found");

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
    const tasks = JSON.parse(clean);

    await prisma.task.createMany({
      data: tasks.map((task: any, index: number) => ({
        title: task.title,
        description: task.description,
        priority: task.priority ?? "MEDIUM",
        status: "TODO",
        order: index,
        prdId: input.prdId,
      })),
    });

    await prisma.featureRequest.update({
      where: { id: input.featureId },
      data: { status: "TASKS_READY" },
    });

    return { tasksCreated: tasks.length };
  }),

  getAll: protectedProcedure
    .input(z.object({ prdId: z.string() }))
    .query(async ({ input }) => {
      return prisma.task.findMany({
        where: { prdId: input.prdId },
        orderBy: { order: "asc" },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.task.update({
        where: { id: input.taskId },
        data: { status: input.status },
      });
    }),
});