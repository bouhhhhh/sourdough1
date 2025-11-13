import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {
  try {
    const { paymentMethodId, amount, shippingAmount, currency, productId, productName, quantity, shippingAddress, shippingOptionId, payerEmail } = (await req.json()) as {
      paymentMethodId: string;
      amount: number; // cents
      shippingAmount?: number; // cents
      currency: string; // e.g. "cad"
      productId?: string;
      productName?: string;
      quantity?: number;
      shippingAddress?: any;
      shippingOptionId?: string | null;
      payerEmail?: string | null;
    };

    console.log("[INSTANT-CHECKOUT] Request received:", {
      amount,
      shippingAmount,
      totalAmount: amount + (shippingAmount || 0),
      currency,
      productId,
      productName,
      quantity,
      shippingOptionId,
      hasPayerEmail: !!payerEmail,
    });
    if (!shippingAmount || Number(shippingAmount) === 0) {
      console.warn("[INSTANT-CHECKOUT] WARNING: shippingAmount is zero or missing. Request body may not include updated shipping.", {
        shippingAmount,
      });
    }

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

    console.log("[INSTANT-CHECKOUT] Creating PaymentIntent:", {
      totalAmount,
      breakdown: { product: amount, shipping: shippingAmount || 0 },
    });

    const intent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: currency.toLowerCase(),
      payment_method: paymentMethodId,
      confirmation_method: "automatic",
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/confirmation`,
      metadata: {
        productId: String(productId ?? ""),
        productName: String(productName ?? ""),
        quantity: String(quantity ?? 1),
        orderNumber,
        shippingOptionId: String(shippingOptionId ?? ""),
        shippingAmount: String(shippingAmount ?? 0),
        productAmount: String(amount),
        payerEmail: String(payerEmail ?? ""),
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

    console.log("[INSTANT-CHECKOUT] PaymentIntent created:", {
      id: intent.id,
      amount: intent.amount,
      status: intent.status,
      metadata: intent.metadata,
    });

    if (intent.status === "requires_action" && intent.next_action?.type === "use_stripe_sdk") {
      return NextResponse.json({
        requiresAction: true,
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
      });
    }

    if (intent.status === "succeeded") {
      // Fire-and-forget confirmation email using Resend API route
      (async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL}`;
          const orderDate = new Date().toLocaleString("en-CA", { timeZone: "America/Toronto" });
          const emailPayload = {
            email: payerEmail || "",
            orderNumber,
            orderDate,
            items: [
              {
                name: productName || String(productId || "Item"),
                quantity: Number(quantity || 1),
                price: Number(amount),
              },
            ],
            total: intent.amount,
            currency: currency.toUpperCase(),
            shippingAddress: {
              name: intent.shipping?.name || "",
              address: {
                line1: intent.shipping?.address?.line1 || "",
                line2: intent.shipping?.address?.line2 || "",
                city: intent.shipping?.address?.city || "",
                state: intent.shipping?.address?.state || "",
                postal_code: intent.shipping?.address?.postal_code || "",
                country: intent.shipping?.address?.country || "",
              },
            },
          };

          if (emailPayload.email) {
            await fetch(`${baseUrl}/api/send-confirmation-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(emailPayload),
            });
          } else {
            console.warn("[INSTANT-CHECKOUT] Skipping confirmation email: missing payerEmail");
          }
        } catch (e) {
          console.error("[INSTANT-CHECKOUT] Failed to send confirmation email:", e);
        }
      })();

      return NextResponse.json({ status: "succeeded", paymentIntentId: intent.id });
    }

    return NextResponse.json({ error: `Unexpected status: ${intent.status}` }, { status: 400 });
  } catch (err: any) {
    console.error("instant-checkout error:", err);
    return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
  }
}
