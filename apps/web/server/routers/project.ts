import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        orgSlug: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const org = await prisma.organization.findUnique({
        where: { slug: input.orgSlug },
      });

      if (!org) throw new Error("Organization not found");

      const project = await prisma.project.create({
        data: {
          name: input.name,
          description: input.description,
          orgId: org.id,
        },
      });

      return project;
    }),

  getAll: protectedProcedure
    .input(z.object({ orgSlug: z.string() }))
    .query(async ({ input }) => {
      const org = await prisma.organization.findUnique({
        where: { slug: input.orgSlug },
        include: {
          projects: true,
        },
      });
      return org?.projects ?? [];
    }),

  getOne: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return prisma.project.findUnique({
        where: { id: input.projectId },
        include: {
          github: true,
          features: true,
        },
      });
    }),
});