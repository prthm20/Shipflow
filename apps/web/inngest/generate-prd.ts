import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";

export const generatePRDFunction = inngest.createFunction(
  {
    id: "generate-prd",
    name: "Generate PRD from Feature",
    triggers: [{ event: "shipflow/feature.clarified" }],
  },
  async ({ event, step }) => {
    const { featureId } = event.data;

    const feature = await step.run("fetch-feature", async () => {
      return prisma.featureRequest.findUnique({ where: { id: featureId } });
    });

    if (!feature) throw new Error("Feature not found");

    const prdData = await step.run("generate-prd-with-ai", async () => {
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
              content: `You are a senior product manager. Generate a detailed PRD in JSON format.
Return ONLY valid JSON, no markdown, no explanation.`,
            },
            {
              role: "user",
              content: `Generate a PRD for this feature:
Title: ${feature.title}
Description: ${feature.description}

Return this exact JSON:
{
  "problemStatement": "string",
  "goals": ["string"],
  "nonGoals": ["string"],
  "userStories": [{"as": "string", "iWant": "string", "soThat": "string"}],
  "acceptanceCriteria": ["string"],
  "edgeCases": ["string"],
  "successMetrics": ["string"]
}`,
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.choices[0].message.content;
      const clean = text.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    });

    const prd = await step.run("save-prd", async () => {
      return prisma.pRD.create({
        data: {
          featureId,
          problemStatement: prdData.problemStatement,
          goals: prdData.goals,
          nonGoals: prdData.nonGoals,
          userStories: prdData.userStories,
          acceptanceCriteria: prdData.acceptanceCriteria,
          edgeCases: prdData.edgeCases,
          successMetrics: prdData.successMetrics,
        },
      });
    });

    await step.run("update-status", async () => {
      await prisma.featureRequest.update({
        where: { id: featureId },
        data: { status: "PRD_READY" },
      });
    });

    return { prdId: prd.id };
  }
);