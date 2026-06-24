import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import { Octokit } from "@octokit/rest";

async function callClaude(system: string, prompt: string): Promise<string> {
  const response = await fetch("https://aicredits.in/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.ANTHROPIC_API_KEY}`,
    },
    body: JSON.stringify({
      model: "anthropic/claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

export const reviewRouter = createTRPCRouter({
  runAIReview: protectedProcedure
    .input(
      z.object({
        featureId: z.string(),
        projectId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const feature = await prisma.featureRequest.findUnique({
          where: { id: input.featureId },
          include: {
            prd: true,
            pullRequest: true,
          },
        });

        console.log("Feature:", feature?.id, "PR:", feature?.pullRequest?.prNumber);

        if (!feature?.prd) throw new Error("No PRD found");
        if (!feature?.pullRequest) throw new Error("No PR linked");

        const integration = await prisma.gitHubIntegration.findUnique({
          where: { projectId: input.projectId },
        });

        if (!integration) throw new Error("No GitHub integration");

        console.log("Integration:", integration.repoFullName);

        let diff = "No code changes available for review.";

        try {
          const octokit = new Octokit({ auth: integration.accessToken });
          const { data: files } = await octokit.pulls.listFiles({
            owner: integration.repoOwner,
            repo: integration.repoName,
            pull_number: feature.pullRequest.prNumber,
          });

          if (files.length > 0) {
            diff = files
              .map((f) => `File: ${f.filename}\n${f.patch ?? "no diff"}`)
              .join("\n\n---\n\n")
              .slice(0, 8000);
          }
        } catch (githubErr) {
          console.warn("Could not fetch PR diff from GitHub:", githubErr);
        }

        const reviewText = await callClaude(
          `You are a senior QA engineer and code reviewer. 
Review pull requests against PRD requirements.
Return ONLY valid JSON, no markdown.`,
          `Review this PR against the PRD:

PRD Problem: ${feature.prd.problemStatement}
Acceptance Criteria: ${feature.prd.acceptanceCriteria.join(", ")}
Edge Cases: ${feature.prd.edgeCases.join(", ")}

Code Changes:
${diff}

Return JSON:
{
  "summary": "overall review summary",
  "passed": true or false,
  "issues": [
    {
      "title": "issue title",
      "description": "detailed description",
      "severity": "BLOCKING" or "NON_BLOCKING",
      "filePath": "file path or null",
      "category": "requirements|security|performance|quality"
    }
  ]
}`
        );

        console.log("Review text:", reviewText.substring(0, 200));

        let reviewData;
        try {
          const clean = reviewText.replace(/```json|```/g, "").trim();
          reviewData = JSON.parse(clean);
        } catch {
          throw new Error("Failed to parse review from AI");
        }

        const review = await prisma.aIReview.create({
          data: {
            prId: feature.pullRequest.id,
            summary: reviewData.summary,
            passed: reviewData.passed,
            status: "COMPLETED",
            issues: {
              create: reviewData.issues.map((issue: any) => ({
                title: issue.title,
                description: issue.description,
                severity: issue.severity,
                filePath: issue.filePath ?? null,
                category: issue.category,
              })),
            },
          },
          include: { issues: true },
        });

        await prisma.featureRequest.update({
          where: { id: input.featureId },
          data: {
            status: reviewData.passed ? "PENDING_APPROVAL" : "FIX_NEEDED",
          },
        });

        try {
          const octokit = new Octokit({ auth: integration.accessToken });
          await octokit.issues.createComment({
            owner: integration.repoOwner,
            repo: integration.repoName,
            issue_number: feature.pullRequest.prNumber,
            body: `## ShipFlow AI Review\n\n${reviewData.summary}\n\n**Status:** ${reviewData.passed ? "✅ Passed" : "❌ Changes Required"}\n\n${reviewData.issues.map((i: any) => `- **${i.severity}**: ${i.title}`).join("\n")}`,
          });
        } catch (commentErr) {
          console.warn("Could not post GitHub comment:", commentErr);
        }

        return review;
      } catch (err) {
        console.error("Review error:", err);
        throw err;
      }
    }),

  getReviews: protectedProcedure
    .input(z.object({ featureId: z.string() }))
    .query(async ({ input }) => {
      const feature = await prisma.featureRequest.findUnique({
        where: { id: input.featureId },
        include: {
          pullRequest: {
            include: {
              reviews: {
                include: { issues: true },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      });

      return feature?.pullRequest?.reviews ?? [];
    }),
});