import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const approvalRouter = createTRPCRouter({
  approve: protectedProcedure
    .input(
      z.object({
        featureId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const approval = await prisma.approval.create({
        data: {
          featureId: input.featureId,
          reviewerId: ctx.user.id,
          decision: "APPROVED",
          notes: input.notes,
        },
      });

      await prisma.featureRequest.update({
        where: { id: input.featureId },
        data: { status: "SHIPPED" },
      });

      return approval;
    }),

  reject: protectedProcedure
    .input(
      z.object({
        featureId: z.string(),
        notes: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const approval = await prisma.approval.create({
        data: {
          featureId: input.featureId,
          reviewerId: ctx.user.id,
          decision: "REJECTED",
          notes: input.notes,
        },
      });

      await prisma.featureRequest.update({
        where: { id: input.featureId },
        data: { status: "REJECTED" },
      });

      return approval;
    }),

  getApproval: protectedProcedure
    .input(z.object({ featureId: z.string() }))
    .query(async ({ input }) => {
      return prisma.approval.findUnique({
        where: { featureId: input.featureId },
        include: { reviewer: true },
      });
    }),
});