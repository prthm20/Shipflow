"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, CreditCard } from "lucide-react";

export default function BillingPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();

  const { data: billing, refetch } = trpc.billing.getStatus.useQuery({ orgSlug });
  const createOrder = trpc.billing.createOrder.useMutation({
    onSuccess: (order) => {
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ShipFlow AI",
        description: "Pro Plan — Monthly",
        order_id: order.orderId,
        handler: async (response: any) => {
          await verifyPayment.mutateAsync({
            orgSlug,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        prefill: {
          name: "ShipFlow User",
        },
        theme: { color: "#000000" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    },
  });

  const verifyPayment = trpc.billing.verifyPayment.useMutation({
    onSuccess: () => refetch(),
  });

  const isPro = billing?.plan === "PRO";
  const creditsPercent = billing
    ? Math.round((billing.creditsUsed / billing.creditsLimit) * 100)
    : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your plan and AI credits</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current Plan</CardTitle>
            <Badge variant={isPro ? "default" : "secondary"}>
              {isPro ? "Pro" : "Free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">AI Credits</p>
                <p className="text-sm text-muted-foreground">
                  {billing?.creditsUsed ?? 0} / {billing?.creditsLimit ?? 100} used
                </p>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${creditsPercent}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={!isPro ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-base">Free</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-4">
              ₹0<span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
            <ul className="flex flex-col gap-2 mb-6">
              {["1 project", "100 AI credits/month", "GitHub integration", "Basic review"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
            <Badge variant="outline" className="w-full justify-center py-2">
              {!isPro ? "Current Plan" : "Downgrade"}
            </Badge>
          </CardContent>
        </Card>

        <Card className={isPro ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Pro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-4">
              ₹999<span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
            <ul className="flex flex-col gap-2 mb-6">
              {[
                "Unlimited projects",
                "1000 AI credits/month",
                "Priority webhooks",
                "Advanced QA reviews",
                "Team collaboration",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <Badge className="w-full justify-center py-2">Current Plan</Badge>
            ) : (
              <Button
                className="w-full"
                onClick={() => createOrder.mutate({ orgSlug })}
                disabled={createOrder.isPending}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {createOrder.isPending ? "Loading..." : "Upgrade to Pro"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}