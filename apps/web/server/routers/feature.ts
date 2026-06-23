import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const featureRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().min(1),
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const feature = await prisma.featureRequest.create({
        data: {
          title: input.title,
          description: input.description,
          projectId: input.projectId,
          authorId: ctx.user.id,
          status: "DRAFT",
        },
      });
      return feature;
    }),

  getAll: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return prisma.featureRequest.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: "desc" },
        include: {
          author: true,
          prd: true,
        },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ featureId: z.string() }))
    .query(async ({ input }) => {
      return prisma.featureRequest.findUnique({
        where: { id: input.featureId },
        include: {
          author: true,
          prd: {
            include: {
              tasks: true,
            },
          },
          pullRequest: {
            include: {
              reviews: {
                include: {
                  issues: true,
                },
              },
            },
          },
          approval: true,
        },
      });
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        featureId: z.string(),
        status: z.enum([
          "DRAFT",
          "CLARIFYING",
          "PRD_GENERATING",
          "PRD_READY",
          "TASKS_READY",
          "IN_DEVELOPMENT",
          "IN_REVIEW",
          "FIX_NEEDED",
          "PENDING_APPROVAL",
          "APPROVED",
          "SHIPPED",
          "REJECTED",
        ]),
      })
    )
    .mutation(async ({ input }) => {
      return prisma.featureRequest.update({
        where: { id: input.featureId },
        data: { status: input.status },
      });
    }),
});