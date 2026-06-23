"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, User } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function NewFeaturePage() {
  const { orgSlug, projectId } = useParams<{ orgSlug: string; projectId: string }>();
  const router = useRouter();

  const [step, setStep] = useState<"form" | "clarify" | "generating">("form");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [featureId, setFeatureId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");

  const createFeature = trpc.feature.create.useMutation({
    onSuccess: async (feature) => {
      setFeatureId(feature.id);
      setMessages([{ role: "user", content: `${title}\n\n${description}` }]);
      clarify.mutate({ featureId: feature.id });
    },
  });

  const clarify = trpc.ai.clarify.useMutation({
    onSuccess: (result) => {
      if (result.isReady) {
        setStep("generating");
        generatePRD.mutate({ featureId });
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.message },
        ]);
        setStep("clarify");
      }
    },
  });

  const generatePRD = trpc.ai.generatePRD.useMutation({
    onSuccess: () => {
      router.push(`/${orgSlug}/projects/${projectId}/features`);
    },
  });

  const handleSubmitForm = () => {
    if (!title || !description) return;
    createFeature.mutate({ title, description, projectId });
  };

  const handleSendResponse = () => {
    if (!userInput.trim()) return;
    const response = userInput;
    setUserInput("");
    setMessages((prev) => [...prev, { role: "user", content: response }]);
    clarify.mutate({ featureId, userResponse: response });
  };

  if (step === "generating") {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
        <p className="text-lg font-medium">Generating your PRD...</p>
        <p className="text-muted-foreground text-sm">This may take a few seconds</p>
      </div>
    );
  }

  if (step === "clarify") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">AI Clarification</h1>
          <p className="text-muted-foreground">Answer a few questions to improve your PRD</p>
        </div>

        <Card className="mb-4">
          <CardContent className="pt-4 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ${
                  msg.role === "assistant"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}>
                  {msg.role === "assistant" ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className={`rounded-lg p-3 max-w-sm text-sm ${
                  msg.role === "assistant"
                    ? "bg-secondary"
                    : "bg-primary text-primary-foreground"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {clarify.isPending && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg p-3 bg-secondary text-sm">
                  Thinking...
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Textarea
            placeholder="Your response..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1"
            rows={2}
          />
          <Button
            onClick={handleSendResponse}
            disabled={clarify.isPending || !userInput.trim()}
            size="icon"
            className="h-auto"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Feature Request</h1>
        <p className="text-muted-foreground">Describe what you want to build</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Badge variant="outline">Step 1</Badge>
            Describe your feature
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Feature title</label>
            <Input
              placeholder="e.g. Add dark mode support"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe the feature in as much detail as you can..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>
          <Button
            onClick={handleSubmitForm}
            disabled={createFeature.isPending || clarify.isPending || !title || !description}
            className="w-full"
          >
            {createFeature.isPending || clarify.isPending
              ? "Submitting..."
              : "Submit & Start AI Clarification"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}