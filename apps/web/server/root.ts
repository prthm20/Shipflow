import { createTRPCRouter, publicProcedure } from "./trpc";
import { organizationRouter } from "./routers/organization";
import { projectRouter } from "./routers/project";
import { featureRouter } from "./routers/feature";
import { aiRouter } from "./routers/ai";
import { taskRouter } from "./routers/task";
import { githubRouter } from "./routers/github";
import { reviewRouter } from "./routers/review";
export const appRouter = createTRPCRouter({
  healthcheck: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
  organization: organizationRouter,
   project: projectRouter,
   feature: featureRouter,
   ai: aiRouter,
   task: taskRouter,
   github: githubRouter,
   review: reviewRouter,
});
console.log("Router keys:", Object.keys(appRouter._def.procedures));
export type AppRouter = typeof appRouter;