import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const event = req.headers.get("x-github-event");

    if (event === "pull_request") {
      const { action, pull_request, repository } = payload;

      if (action === "opened" || action === "synchronize") {
        const integration = await prisma.gitHubIntegration.findFirst({
          where: { repoFullName: repository.full_name },
        });

        if (!integration) {
          return NextResponse.json({ message: "Integration not found" }, { status: 404 });
        }

        await prisma.pullRequest.upsert({
          where: {
            featureId: integration.projectId,
          },
          create: {
            featureId: integration.projectId,
            githubId: integration.id,
            prNumber: pull_request.number,
            title: pull_request.title,
            branch: pull_request.head.ref,
            url: pull_request.html_url,
            status: "OPEN",
          },
          update: {
            title: pull_request.title,
            status: "OPEN",
          },
        });
      }
    }

    return NextResponse.json({ message: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}