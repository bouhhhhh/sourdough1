import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
      // Send confirmation email directly via Resend to avoid route auth/caching issues
      (async () => {
        try {
          const orderDate = new Date().toLocaleString("en-CA", { timeZone: "America/Toronto" });
          const toEmail = (payerEmail || "").trim();
          const from = process.env.EMAIL_FROM;
          const adminEmail = process.env.ADMIN_EMAIL || from;
          const itemName = productName || String(productId || "Item");
          const qty = Number(quantity || 1);
          const productAmount = Number(amount);
          const currencyUpper = currency.toUpperCase();

          if (resend && from && toEmail) {
            const html = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial;">
                <h2 style="color:#16a34a;margin:0 0 8px;">Order confirmed</h2>
                <div style="margin:8px 0;">Order <strong>${orderNumber}</strong> • ${orderDate}</div>
                <table style="width:100%;border-collapse:collapse;margin-top:12px;">
                  <tr>
                    <td style="padding:8px 0;">${qty}× ${itemName}</td>
                    <td style="padding:8px 0;text-align:right;">${new Intl.NumberFormat('en-CA',{style:'currency',currency:currencyUpper}).format((productAmount*qty)/100)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">Shipping</td>
                    <td style="padding:8px 0;text-align:right;">${new Intl.NumberFormat('en-CA',{style:'currency',currency:currencyUpper}).format(((intent.amount - productAmount)/100))}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-weight:700;border-top:1px solid #e5e7eb;">Total paid</td>
                    <td style="padding:8px 0;text-align:right;font-weight:700;border-top:1px solid #e5e7eb;">${new Intl.NumberFormat('en-CA',{style:'currency',currency:currencyUpper}).format((intent.amount)/100)}</td>
                  </tr>
                </table>
              </div>`;

            const { error } = await resend.emails.send({
              from,
              to: [toEmail],
              subject: `Order Confirmation - ${orderNumber}`,
              html,
            });
            if (error) {
              console.error("[INSTANT-CHECKOUT] Resend customer email error:", error);
            }
          } else {
            console.warn("[INSTANT-CHECKOUT] Skipping customer email. resend?, from?, to?", !!resend, !!from, !!toEmail);
          }

          // Admin notification (best-effort)
          try {
            if (resend && adminEmail) {
              await resend.emails.send({
                from: from || adminEmail,
                to: [adminEmail],
                subject: `New order - ${orderNumber}`,
                html: `<div>Order ${orderNumber} • ${orderDate}<br/>Total: ${new Intl.NumberFormat('en-CA',{style:'currency',currency:currencyUpper}).format((intent.amount)/100)}</div>`,
              });
            }
          } catch (e) {
            console.error("[INSTANT-CHECKOUT] Resend admin email error:", e);
          }
        } catch (e) {
          console.error("[INSTANT-CHECKOUT] Failed email dispatch:", e);
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
