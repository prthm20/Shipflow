import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { Octokit } from "@octokit/rest";

export const githubRouter = createTRPCRouter({
  connectRepo: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        repoOwner: z.string(),
        repoName: z.string(),
        accessToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const octokit = new Octokit({ auth: input.accessToken });

      const { data: repo } = await octokit.repos.get({
        owner: input.repoOwner,
        repo: input.repoName,
      });

      const integration = await prisma.gitHubIntegration.upsert({
        where: { projectId: input.projectId },
        create: {
          projectId: input.projectId,
          repoOwner: input.repoOwner,
          repoName: input.repoName,
          repoFullName: repo.full_name,
          accessToken: input.accessToken,
        },
        update: {
          repoOwner: input.repoOwner,
          repoName: input.repoName,
          repoFullName: repo.full_name,
          accessToken: input.accessToken,
        },
      });

      return integration;
    }),

  getIntegration: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return prisma.gitHubIntegration.findUnique({
        where: { projectId: input.projectId },
      });
    }),

  listPRs: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const integration = await prisma.gitHubIntegration.findUnique({
        where: { projectId: input.projectId },
      });

      if (!integration) return [];

      const octokit = new Octokit({ auth: integration.accessToken });

      const { data: prs } = await octokit.pulls.list({
        owner: integration.repoOwner,
        repo: integration.repoName,
        state: "open",
      });

      return prs.map((pr) => ({
        number: pr.number,
        title: pr.title,
        branch: pr.head.ref,
        url: pr.html_url,
        state: pr.state,
        createdAt: pr.created_at,
        user: pr.user?.login,
      }));
    }),

  getPRDiff: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        prNumber: z.number(),
      })
    )
    .query(async ({ input }) => {
      const integration = await prisma.gitHubIntegration.findUnique({
        where: { projectId: input.projectId },
      });

      if (!integration) throw new Error("No GitHub integration found");

      const octokit = new Octokit({ auth: integration.accessToken });

      const { data: files } = await octokit.pulls.listFiles({
        owner: integration.repoOwner,
        repo: integration.repoName,
        pull_number: input.prNumber,
      });

      return files.map((f) => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patch: f.patch ?? "",
      }));
    }),

  linkPRToFeature: protectedProcedure
    .input(
      z.object({
        featureId: z.string(),
        projectId: z.string(),
        prNumber: z.number(),
        title: z.string(),
        branch: z.string(),
        url: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const integration = await prisma.gitHubIntegration.findUnique({
        where: { projectId: input.projectId },
      });

      if (!integration) throw new Error("No GitHub integration found");

      const pr = await prisma.pullRequest.upsert({
        where: { featureId: input.featureId },
        create: {
          featureId: input.featureId,
          githubId: integration.id,
          prNumber: input.prNumber,
          title: input.title,
          branch: input.branch,
          url: input.url,
          status: "OPEN",
        },
        update: {
          prNumber: input.prNumber,
          title: input.title,
          branch: input.branch,
          url: input.url,
        },
      });

      await prisma.featureRequest.update({
        where: { id: input.featureId },
        data: { status: "IN_REVIEW" },
      });

      return pr;
    }),
});