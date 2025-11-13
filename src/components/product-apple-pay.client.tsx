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
        // Normalize postal/zip: keep only alphanumeric and uppercase
        const rawPostal = (addr.postalCode || addr.postal_code || "") as string;
        const normalizedPostal = rawPostal.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        const country = ((addr.country as string) || "CA").toUpperCase();
        const destination = {
          postalCode: normalizedPostal,
          country,
          city: addr.city || addr.locality || undefined,
          province: addr.region || addr.administrativeArea || undefined,
        };

        // Always log for debugging Canadian addresses
        // eslint-disable-next-line no-console
        console.log("[PRB] shippingaddresschange", {
          country: destination.country,
          postalCode: destination.postalCode,
          rawCountry: addr.country,
          rawPostal,
          province: destination.province,
        });

        // Validate postal/zip by country
        if (!destination.postalCode || !destination.country) {
          console.log("[PRB] Invalid: missing postal or country");
          ev.updateWith({ status: "invalid_shipping_address" });
          return;
        }

        // // CA postal: must be 6 chars matching A1A1A1 pattern
        // if (destination.country === "CA") {
        //   const isValidCA = destination.postalCode.length === 6 && /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(destination.postalCode);
        //   console.log("[PRB] CA validation:", { isValidCA, length: destination.postalCode.length, postal: destination.postalCode });
        //   if (!isValidCA) {
        //     ev.updateWith({ status: "invalid_shipping_address" });
        //     return;
        //   }
        // }
        // US ZIP: must be 5 or 9 digits
        // else if (destination.country === "US") {
        //   if (!/^\d{5}(\d{4})?$/.test(destination.postalCode)) {
        //     console.log("[PRB] Invalid US ZIP");
        //     ev.updateWith({ status: "invalid_shipping_address" });
        //     return;
        //   }
        // }
        // Other countries: just require some postal code (no strict validation)

        // Helper: timeout for fetch
        const fetchWithTimeout = async (input: RequestInfo, init: RequestInit & { timeout?: number } = {}) => {
          const { timeout = 5000, ...rest } = init;
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), timeout);
          try {
            // @ts-ignore signal type in older lib
            return await fetch(input as any, { ...rest, signal: controller.signal });
          } finally {
            clearTimeout(id);
          }
        };

        // Mock rates by country for fallback
        const getMockRatesByCountry = (country: string) => {
          if (country === "CA") {
            return [
              { id: "DOM.RP", name: "Regular Parcel", estimatedDays: "5-7 business days", price: 1200 },
              { id: "DOM.EP", name: "Expedited Parcel", estimatedDays: "3-5 business days", price: 1500 },
              { id: "DOM.XP", name: "Xpresspost", estimatedDays: "1-2 business days", price: 2000 },
            ];
          } else if (country === "US") {
            return [
              { id: "USA.EP", name: "Expedited Parcel USA", estimatedDays: "4-7 business days", price: 2500 },
              { id: "USA.XP", name: "Xpresspost USA", estimatedDays: "2-3 business days", price: 3500 },
            ];
          } else {
            return [
              { id: "INT.SP", name: "Small Packet International", estimatedDays: "6-10 business days", price: 3000 },
              { id: "INT.XP", name: "Xpresspost International", estimatedDays: "4-6 business days", price: 5000 },
            ];
          }
        };

        const mockRates = getMockRatesByCountry(destination.country);

        let res: Response | null = null;
        try {
          res = await fetchWithTimeout("/api/shipping-rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ destination, package: { weight: 1 } }),
            timeout: 5000,
          });
        } catch (e) {
          res = null;
        }

        let rates: Array<{ id: string; name: string; estimatedDays: string; price: number }> = [];
        if (res) {
          try {
            const data = (await res.json()) as { rates: Array<{ id: string; name: string; estimatedDays: string; price: number }> };
            rates = data.rates || [];
          } catch (_) {
            rates = [];
          }
        }

        if (process.env.NEXT_PUBLIC_DEBUG_SHIPPING === "1" || process.env.NEXT_PUBLIC_DEBUG_SHIPPING === "true") {
          // eslint-disable-next-line no-console
          console.log("[PRB] rates response:", res?.status, rates);
        }

        // Fallback to mock if fetch failed or no rates returned
        if (!res || !res.ok || rates.length === 0) {
          rates = mockRates;
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
