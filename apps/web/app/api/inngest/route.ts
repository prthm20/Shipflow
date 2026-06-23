import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { generateTasks } from "@/inngest/generate-tasks";
import { generatePRDFunction } from "@/inngest/generate-prd";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateTasks, generatePRDFunction],
});