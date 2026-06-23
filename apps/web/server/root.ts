import { createTRPCRouter, publicProcedure } from "./trpc";
import { organizationRouter } from "./routers/organization";
import { projectRouter } from "./routers/project";
import { featureRouter } from "./routers/feature";
import { aiRouter } from "./routers/ai";
import { taskRouter } from "./routers/task";
export const appRouter = createTRPCRouter({
  healthcheck: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
  organization: organizationRouter,
   project: projectRouter,
   feature: featureRouter,
   ai: aiRouter,
   task: taskRouter,
});
console.log("Router keys:", Object.keys(appRouter._def.procedures));
export type AppRouter = typeof appRouter;