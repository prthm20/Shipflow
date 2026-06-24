import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  GitPullRequest,
  Bot,
  CheckCircle,
  ArrowRight,
  FileText,
  CheckSquare,
  GitBranch,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-semibold text-lg">ShipFlow AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto">
        <Badge variant="outline" className="mb-6">
          AI-Powered Product Delivery
        </Badge>
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          From Feature Request to{" "}
          <span className="text-primary">Production</span>
          {" "}in Minutes
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
          ShipFlow AI automates your entire software delivery lifecycle — from idea to PRD to code review to ship. Let AI handle the process so your team can focus on building.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              View demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Core loop */}
      <section className="px-6 py-16 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">The ShipFlow Loop</h2>
          <p className="text-muted-foreground text-center mb-12">
            Every feature follows a structured AI-assisted workflow
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: "Feature Request", desc: "Submit an idea or customer request" },
              { icon: Bot, label: "AI Clarification", desc: "AI gathers missing context automatically" },
              { icon: FileText, label: "PRD Generation", desc: "Structured PRD generated in seconds" },
              { icon: CheckSquare, label: "Task Breakdown", desc: "Engineering tasks created from PRD" },
              { icon: GitBranch, label: "GitHub Connect", desc: "Link your repo and track PRs" },
              { icon: Bot, label: "AI Code Review", desc: "QA agent reviews code against PRD" },
              { icon: GitPullRequest, label: "Fix & Re-review", desc: "Iterate until the code is ready" },
              { icon: CheckCircle, label: "Ship It", desc: "Human approves and feature is live" },
            ].map((step, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-4 rounded-lg border bg-background"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-3">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-medium text-sm mb-1">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Everything your team needs</h2>
        <p className="text-muted-foreground text-center mb-12">
          Built for modern product and engineering teams
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Bot,
              title: "AI Clarification Agent",
              desc: "Never ship a vague feature again. Our AI asks the right questions before writing a single line of code.",
            },
            {
              icon: FileText,
              title: "Auto PRD Generation",
              desc: "Generate structured PRDs with problem statements, user stories, acceptance criteria, and edge cases.",
            },
            {
              icon: CheckSquare,
              title: "Smart Task Breakdown",
              desc: "AI converts your PRD into prioritized engineering tasks and organizes them on a Kanban board.",
            },
            {
              icon: GitBranch,
              title: "GitHub Integration",
              desc: "Connect your repos, track pull requests, and receive webhook events automatically.",
            },
            {
              icon: Bot,
              title: "AI Code Review",
              desc: "QA agent reviews your PR against PRD requirements — not just syntax, but actual product compliance.",
            },
            {
              icon: CheckCircle,
              title: "Human Approval Flow",
              desc: "Humans stay in control. Review AI findings and approve or reject before anything ships.",
            },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-lg border">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16 bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-muted-foreground text-center mb-12">Start free, scale as you grow</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border bg-background">
              <p className="font-semibold text-lg mb-1">Free</p>
              <p className="text-3xl font-bold mb-4">₹0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
              <ul className="flex flex-col gap-2 mb-6">
                {["1 project", "100 AI credits/month", "GitHub integration", "Basic review"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                <Button variant="outline" className="w-full">Get started free</Button>
              </Link>
            </div>
            <div className="p-6 rounded-lg border bg-primary text-primary-foreground">
              <p className="font-semibold text-lg mb-1">Pro</p>
              <p className="text-3xl font-bold mb-4">₹999<span className="text-sm font-normal opacity-70">/month</span></p>
              <ul className="flex flex-col gap-2 mb-6">
                {["Unlimited projects", "1000 AI credits/month", "Priority GitHub webhooks", "Advanced QA reviews", "Team collaboration", "Priority support"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                <Button variant="secondary" className="w-full">Upgrade to Pro</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 flex flex-col items-center text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to ship faster?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl">
          Join teams that use ShipFlow AI to go from idea to production with confidence.
        </p>
        <Link href="/login">
          <Button size="lg" className="gap-2">
            Get started for free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 ShipFlow AI. Built with ❤️ for the ChaiCode Hackathon.</p>
      </footer>
    </div>
  );
}