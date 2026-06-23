import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";

async function callClaude(system: string, prompt: string): Promise<string> {
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
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  const rawText = await response.text();
  console.log("Raw API response:", rawText.substring(0, 200));

  if (!response.ok) {
    throw new Error(`API error: ${rawText}`);
  }

  const data = JSON.parse(rawText);
  return data.choices[0].message.content;
}

export const aiRouter = createTRPCRouter({
  clarify: protectedProcedure
    .input(
      z.object({
        featureId: z.string(),
        userResponse: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const feature = await prisma.featureRequest.findUnique({
        where: { id: input.featureId },
      });

      if (!feature) throw new Error("Feature not found");

      try {
        const text = await callClaude(
          `You are a senior product manager at a software company. 
Your job is to gather enough context from a feature request to write a detailed PRD.
Analyze the feature request and either:
1. Ask ONE specific follow-up question if critical information is missing
2. Reply with "READY" if you have enough context to write a PRD

Be concise. Ask only the most important missing question.
If the request is clear enough, just say "READY".`,
          `Feature Request Title: ${feature.title}
Feature Request Description: ${feature.description}
${input.userResponse ? `User's additional context: ${input.userResponse}` : ""}

Do you have enough context to write a PRD, or do you need more information?`
        );

        const isReady = text.trim().startsWith("READY");

        await prisma.featureRequest.update({
          where: { id: input.featureId },
          data: {
            status: isReady ? "PRD_GENERATING" : "CLARIFYING",
          },
        });

        return {
          isReady,
          message: isReady
            ? "Great! I have enough context. Generating your PRD now..."
            : text,
        };
      } catch (err) {
        console.error("AI clarify error:", err);
        throw err;
      }
    }),

  generatePRD: protectedProcedure
    .input(z.object({ featureId: z.string() }))
    .mutation(async ({ input }) => {
      const feature = await prisma.featureRequest.findUnique({
        where: { id: input.featureId },
      });

      if (!feature) throw new Error("Feature not found");

      try {
        const text = await callClaude(
          `You are a senior product manager. Generate a detailed PRD in JSON format.
Return ONLY valid JSON, no markdown, no explanation, no extra text.
The response must start with { and end with }`,
          `Generate a PRD for this feature:
Title: ${feature.title}
Description: ${feature.description}

Return this exact JSON structure:
{
  "problemStatement": "one sentence",
  "goals": ["goal 1", "goal 2"],
  "nonGoals": ["non-goal 1"],
  "userStories": [{"as": "user type", "iWant": "action", "soThat": "benefit"}],
  "acceptanceCriteria": ["criteria 1", "criteria 2"],
  "edgeCases": ["edge case 1"],
  "successMetrics": ["metric 1"]
}`
        );

        let prdData;
        try {
          const clean = text.replace(/```json|```/g, "").trim();
          prdData = JSON.parse(clean);
        } catch {
          console.error("Failed to parse PRD JSON:", text);
          throw new Error("Failed to parse PRD from AI");
        }

        const prd = await prisma.pRD.create({
          data: {
            featureId: input.featureId,
            problemStatement: prdData.problemStatement,
            goals: prdData.goals,
            nonGoals: prdData.nonGoals,
            userStories: prdData.userStories,
            acceptanceCriteria: prdData.acceptanceCriteria,
            edgeCases: prdData.edgeCases,
            successMetrics: prdData.successMetrics,
          },
        });

        await prisma.featureRequest.update({
          where: { id: input.featureId },
          data: { status: "PRD_READY" },
        });

        return prd;
      } catch (err) {
        console.error("AI generatePRD error:", err);
        throw err;
      }
    }),
});