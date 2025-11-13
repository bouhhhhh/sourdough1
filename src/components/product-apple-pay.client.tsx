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
  const [shippingAmount, setShippingAmount] = useState<number>(0);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) return;
    // Create a new Payment Request instance
    const pr = stripe.paymentRequest({
      country: "CA",
      currency: currency.toLowerCase(),
      total: { label: productName || "HeirBloom", amount },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,
    });

    pr.canMakePayment().then((result) => {
      const isSupported = !!result; // Apple Pay or other wallets available
      setSupported(isSupported);
      if (isSupported) setPaymentRequest(pr);
    });

    // When user changes shipping address, fetch dynamic rates and update total/options
    pr.on("shippingaddresschange", async (ev: any) => {
      try {
        const addr = ev.shippingAddress || {};
        const destination = {
          postalCode: addr.postalCode || addr.postal_code || "",
          country: (addr.country || "CA").toUpperCase(),
          city: addr.city || addr.locality || undefined,
          province: addr.region || addr.administrativeArea || undefined,
        };

        if (!destination.postalCode || !destination.country) {
          ev.updateWith({ status: "invalid_shipping_address" });
          return;
        }

        const res = await fetch("/api/shipping-rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination, package: { weight: 1 } }),
        });

        const data = (await res.json()) as { rates: Array<{ id: string; name: string; estimatedDays: string; price: number; }> };
        const rates = data.rates || [];

        if (!res.ok || rates.length === 0) {
          ev.updateWith({ status: "fail" });
          return;
        }

        // Build shipping options from rates; select the cheapest by default
        let cheapest: { id: string; name: string; estimatedDays: string; price: number } | null = null;
        for (const r of rates) {
          if (!cheapest || r.price < cheapest.price) cheapest = r;
        }
        const options = rates.map((r) => ({
          id: r.id,
          label: r.name,
          detail: r.estimatedDays,
          amount: r.price,
        }));

        if (!cheapest) {
          ev.updateWith({ status: "fail" });
          return;
        }

        setSelectedShippingId(cheapest.id);
        setShippingAmount(cheapest.price);

        ev.updateWith({
          status: "success",
          shippingOptions: options.map((o) => ({ ...o, selected: o.id === cheapest.id })),
          total: { label: productName || "HeirBloom", amount: amount + cheapest.price },
        });
      } catch (error) {
        console.error("Shipping address change error:", error);
        ev.updateWith({ status: "fail" });
      }
    });

    // When user selects a different shipping option, update totals
    pr.on("shippingoptionchange", (ev: any) => {
      try {
        const opt = ev.shippingOption;
        const price = Number(opt?.amount ?? 0);
        setSelectedShippingId(opt?.id || null);
        setShippingAmount(price);
        ev.updateWith({
          status: "success",
          total: { label: productName || "HeirBloom", amount: amount + price },
        });
      } catch (error) {
        console.error("Shipping option change error:", error);
        ev.updateWith({ status: "fail" });
      }
    });

    pr.on("paymentmethod", async (ev) => {
      try {
        const res = await fetch("/api/instant-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethodId: ev.paymentMethod.id,
            amount, // base product amount (cents)
            shippingAmount, // dynamic shipping (cents)
            currency: currency.toLowerCase(),
            productId,
            quantity,
            shippingAddress: ev.shippingAddress || undefined,
            shippingOptionId: selectedShippingId,
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
