import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

export const organizationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.organization.findUnique({
        where: { slug: input.slug },
      });

      if (existing) {
        throw new Error("Slug already taken");
      }

      const org = await prisma.organization.create({
        data: {
          name: input.name,
          slug: input.slug,
          members: {
            create: {
              userId: ctx.user.id,
              role: "OWNER",
            },
          },
        },
      });

      return org;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await prisma.orgMember.findMany({
      where: { userId: ctx.user.id },
      include: { org: true },
    });
    return memberships.map((m) => m.org);
  }),

  getCurrent: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const org = await prisma.organization.findUnique({
        where: { slug: input.slug },
        include: {
          members: {
            include: { user: true },
          },
        },
      });
      return org;
    }),
});