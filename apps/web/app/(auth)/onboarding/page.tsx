"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Zap } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  const createOrg = trpc.organization.create.useMutation({
    onSuccess: (org) => {
      router.push(`/${org.slug}/dashboard`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  const handleSubmit = () => {
    if (!name || !slug) return;
    setError("");
    createOrg.mutate({ name, slug });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create your organization</CardTitle>
          <CardDescription>
            This is your team's workspace on ShipFlow AI
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Organization name</label>
            <Input
              placeholder="Acme Inc."
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">URL slug</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">shipflow.ai/</span>
              <Input
                placeholder="acme-inc"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            onClick={handleSubmit}
            disabled={createOrg.isPending || !name || !slug}
            className="w-full"
          >
            {createOrg.isPending ? "Creating..." : "Create organization"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}