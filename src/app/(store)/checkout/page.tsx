"use client";

import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { cart } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creatingPI, setCreatingPI] = useState(false);
  const currency = cart?.currency || "CAD";

  useEffect(() => {
    (async () => {
      console.log("Checkout: cart from context:", cart);

      if (cart && cart.items && cart.items.length > 0) {
        console.log("Checkout: cart has items, creating payment intent...");
        
        // Calculate total from items (cart might not have total field)
        const total = cart.total || cart.items.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);
        
        console.log("Checkout: calculated total:", total);
        
        if (total > 0) {
          setCreatingPI(true);
          const res = await fetch("/api/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: total,
              currency: (currency || "CAD").toLowerCase(),
              cartId: cart.id,
            }),
          });
          const data = (await res.json()) as { clientSecret?: string };
          setClientSecret(data.clientSecret || null);
          setCreatingPI(false);
        }
      } else {
        console.log("Checkout: cart is empty or has no items");
      }
    })();
  }, [cart, currency]);


  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  const options = useMemo(
    () =>
      clientSecret
        ? ({
            clientSecret,
            appearance: { theme: "stripe" },
            locale: "en",
          } as const)
        : undefined,
    [clientSecret]
  );

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <ul className="divide-y">
        {cart.items.map((it: any) => {
          const itemName = it.name || it.product?.name || `Product ${it.productId}`;
          const itemPrice = it.price * it.quantity;
          
          return (
            <li key={it.id} className="py-3 flex items-center justify-between">
              <div className="mr-4">
                <div className="font-medium">{itemName}</div>
                <div className="text-sm text-gray-500">Qty: {it.quantity}</div>
              </div>
              <div className="text-right">
                {formatMoney({
                  amount: itemPrice, // cents
                  currency,
                  locale: "en-CA",
                })}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-center justify-between text-lg font-semibold">
        <span>Total</span>
        <span>
          {formatMoney({
            amount: cart.total || cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            currency,
            locale: "en-CA",
          })}
        </span>
      </div>

      {/* Stripe Payment Element */}
      <div className="mt-8 max-w-lg">
        {creatingPI && <div>Preparing payment…</div>}
        {clientSecret && options && (
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm returnUrl={`${window.location.origin}/orders/thank-you`} />
          </Elements>
        )}
      </div>
    </div>
  );
}

function CheckoutForm({ returnUrl }: { returnUrl: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });
    setSubmitting(false);

    if (error) {
      // Show message in UI; errors are user-facing and localized by Stripe
      setMessage(error.message ?? "Payment failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {submitting ? "Processing…" : "Pay now"}
      </button>
      {message && <p className="text-sm text-red-600">{message}</p>}
    </form>
  );
}
