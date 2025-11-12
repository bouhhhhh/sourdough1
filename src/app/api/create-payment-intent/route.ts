import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {
  try {
    const { amount, currency, cartId } = await req.json() as { amount: number; currency: string; cartId?: string };

    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!currency) {
      return NextResponse.json({ error: "Missing currency" }, { status: 400 });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    const pi = await stripe.paymentIntents.create({
      amount,                                       // cents
      currency: currency.toLowerCase(),             // e.g., "cad"
      automatic_payment_methods: { enabled: true }, // Payment Element
      metadata: { 
        cartId: String(cartId ?? ""),
        orderNumber: orderNumber,
      },
    });

    return NextResponse.json({ clientSecret: pi.client_secret, orderNumber });
  } catch (err: any) {
    console.error("create-payment-intent error:", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
