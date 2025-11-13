import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {
  try {
    const { paymentMethodId, amount, shippingAmount, currency, productId, quantity, shippingAddress, shippingOptionId } = (await req.json()) as {
      paymentMethodId: string;
      amount: number; // cents
      shippingAmount?: number; // cents
      currency: string; // e.g. "cad"
      productId?: string;
      quantity?: number;
      shippingAddress?: any;
      shippingOptionId?: string | null;
    };

    if (!paymentMethodId) {
      return NextResponse.json({ error: "Missing paymentMethodId" }, { status: 400 });
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!currency) {
      return NextResponse.json({ error: "Missing currency" }, { status: 400 });
    }

  const orderNumber = `ORD-${Date.now()}`;
  const totalAmount = amount + (shippingAmount || 0);

    const intent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: currency.toLowerCase(),
      payment_method: paymentMethodId,
      confirmation_method: "automatic",
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/confirmation`,
      metadata: {
        productId: String(productId ?? ""),
        quantity: String(quantity ?? 1),
        orderNumber,
        shippingOptionId: String(shippingOptionId ?? ""),
        shippingAmount: String(shippingAmount ?? 0),
      },
      shipping: shippingAddress
        ? {
            name: shippingAddress?.recipient || shippingAddress?.name || undefined,
            phone: shippingAddress?.phone || undefined,
            address: {
              line1: (shippingAddress?.addressLine && shippingAddress.addressLine[0]) || undefined,
              line2: (shippingAddress?.addressLine && shippingAddress.addressLine[1]) || undefined,
              city: shippingAddress?.city || shippingAddress?.locality || undefined,
              state: shippingAddress?.region || shippingAddress?.administrativeArea || undefined,
              postal_code: shippingAddress?.postalCode || shippingAddress?.postal_code || undefined,
              country: shippingAddress?.country || undefined,
            },
          }
        : undefined,
    });

    if (intent.status === "requires_action" && intent.next_action?.type === "use_stripe_sdk") {
      return NextResponse.json({
        requiresAction: true,
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
      });
    }

    if (intent.status === "succeeded") {
      return NextResponse.json({ status: "succeeded", paymentIntentId: intent.id });
    }

    return NextResponse.json({ error: `Unexpected status: ${intent.status}` }, { status: 400 });
  } catch (err: any) {
    console.error("instant-checkout error:", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
