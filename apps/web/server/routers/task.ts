import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/lib/inngest";

export const taskRouter = createTRPCRouter({
  generateFromPRD: protectedProcedure
    .input(z.object({ prdId: z.string(), featureId: z.string() }))
    .mutation(async ({ input }) => {
      await inngest.send({
        name: "shipflow/prd.created",
        data: { prdId: input.prdId, featureId: input.featureId },
      });
      return { queued: true };
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