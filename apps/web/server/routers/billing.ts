import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const billingRouter = createTRPCRouter({
  getStatus: protectedProcedure
    .input(z.object({ orgSlug: z.string() }))
    .query(async ({ input }) => {
      const org = await prisma.organization.findUnique({
        where: { slug: input.orgSlug },
        include: { billing: true },
      });

      if (!org?.billing) {
        await prisma.billing.create({
          data: {
            orgId: org!.id,
            plan: "FREE",
            creditsUsed: 0,
            creditsLimit: 100,
          },
        });
        return { plan: "FREE", creditsUsed: 0, creditsLimit: 100 };
      }

      return {
        plan: org.billing.plan,
        creditsUsed: org.billing.creditsUsed,
        creditsLimit: org.billing.creditsLimit,
      };
    }),

  createOrder: protectedProcedure
    .input(z.object({ orgSlug: z.string() }))
    .mutation(async ({ input }) => {
      const order = await razorpay.orders.create({
        amount: 99900,
        currency: "INR",
        receipt: `order_${input.orgSlug}_${Date.now()}`,
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      };
    }),

  verifyPayment: protectedProcedure
    .input(
      z.object({
        orgSlug: z.string(),
        razorpayOrderId: z.string(),
        razorpayPaymentId: z.string(),
        razorpaySignature: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const crypto = await import("crypto");
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
        .digest("hex");

      if (expectedSignature !== input.razorpaySignature) {
        throw new Error("Invalid payment signature");
      }

      const org = await prisma.organization.findUnique({
        where: { slug: input.orgSlug },
      });

      await prisma.billing.upsert({
        where: { orgId: org!.id },
        create: {
          orgId: org!.id,
          plan: "PRO",
          creditsUsed: 0,
          creditsLimit: 1000,
          razorpayCustomerId: input.razorpayPaymentId,
        },
        update: {
          plan: "PRO",
          creditsLimit: 1000,
          razorpayCustomerId: input.razorpayPaymentId,
        },
      });

      return { success: true };
    }),
});