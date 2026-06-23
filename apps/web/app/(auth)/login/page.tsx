"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, GitBranch } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGitHubLogin = async () => {
    setLoading(true);
    await signIn.social({
  provider: "github",
  callbackURL: "/onboarding",
});
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
   await signIn.social({
  provider: "google",
  callbackURL: "/onboarding",
});
    setLoading(false);
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
          <CardTitle className="text-2xl">ShipFlow AI</CardTitle>
          <CardDescription>
            Feature to Production — sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            <GitBranch className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}