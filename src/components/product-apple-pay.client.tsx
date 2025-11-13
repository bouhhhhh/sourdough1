"use client";

import { useEffect, useState } from "react";
import { Elements, PaymentRequestButtonElement, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { PaymentRequest } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface ProductApplePayProps {
  amount: number; // in smallest currency unit (cents)
  currency: string; // e.g., "cad"
  productId: string;
  productName: string;
  quantity?: number;
  fallback?: React.ReactNode;
}

function ProductApplePayInner(props: ProductApplePayProps) {
  const { amount, currency, productId, productName, quantity = 1, fallback } = props;
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [supported, setSupported] = useState<boolean>(false);

  useEffect(() => {
    if (!stripe) return;
    // Create a new Payment Request instance
    const pr = stripe.paymentRequest({
      country: "CA",
      currency: currency.toLowerCase(),
      total: { label: productName || "HeirBloom", amount },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    pr.canMakePayment().then((result) => {
      const isSupported = !!result; // Apple Pay or other wallets available
      setSupported(isSupported);
      if (isSupported) setPaymentRequest(pr);
    });

    pr.on("paymentmethod", async (ev) => {
      try {
        const res = await fetch("/api/instant-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethodId: ev.paymentMethod.id,
            amount,
            currency: currency.toLowerCase(),
            productId,
            quantity,
          }),
        });

        const data = (await res.json()) as {
          status?: string;
          requiresAction?: boolean;
          clientSecret?: string;
          paymentIntentId?: string;
          error?: string;
        };

        if (!res.ok) {
          ev.complete("fail");
          alert(data?.error || "Payment failed");
          return;
        }

        if (data.requiresAction && data.clientSecret) {
          // Handle additional authentication if required
          const result = await stripe.confirmCardPayment(data.clientSecret);
          if (result.error) {
            ev.complete("fail");
            alert(result.error.message || "Payment authentication failed");
            return;
          }
          ev.complete("success");
          window.location.href = `/confirmation?payment_intent=${data.paymentIntentId}&redirect_status=succeeded`;
          return;
        }

        if (data.status === "succeeded") {
          ev.complete("success");
          window.location.href = `/confirmation?payment_intent=${data.paymentIntentId}&redirect_status=succeeded`;
        } else {
          ev.complete("fail");
          alert("Payment did not succeed. Please try again.");
        }
      } catch (err: any) {
        ev.complete("fail");
        alert(err?.message || "Payment failed");
      }
    });

    return () => {
      // No explicit cleanup needed for pr
    };
  }, [stripe, amount, currency, productId, productName, quantity]);

  if (!supported || !paymentRequest) {
    return <>{fallback ?? null}</>;
  }

  return (
    <div className="w-full">
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: { paymentRequestButton: { type: "buy", theme: "dark", height: "44px" } },
        }}
      />
    </div>
  );
}

export function ProductApplePay(props: ProductApplePayProps) {
  return (
    <Elements stripe={stripePromise}>
      <ProductApplePayInner {...props} />
    </Elements>
  );
}

export default ProductApplePay;
