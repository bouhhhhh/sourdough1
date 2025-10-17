"use client";

import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCart } from "@/context/cart-context";
import { formatMoney } from "@/lib/utils";
import { AddressForm, type AddressFormData } from "@/components/address-form";
import { useTranslations } from "@/i18n/client";
import { Checkbox } from "@/ui/shadcn/checkbox";
import { Label } from "@/ui/shadcn/label";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const { cart } = useCart();
  const t = useTranslations("/cart.page.stripePayment");
  const tPage = useTranslations("/cart.page");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creatingPI, setCreatingPI] = useState(false);
  const currency = cart?.currency || "CAD";
  
  // Address form state
  const [shippingAddress, setShippingAddress] = useState<AddressFormData>({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  
  const [billingAddress, setBillingAddress] = useState<AddressFormData>({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [formErrors, setFormErrors] = useState<{
    shipping?: Partial<AddressFormData>;
    billing?: Partial<AddressFormData>;
  }>({});

  // Sync billing address with shipping when checkbox is checked
  useEffect(() => {
    if (billingSameAsShipping) {
      setBillingAddress(shippingAddress);
    }
  }, [billingSameAsShipping, shippingAddress]);

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
      <h1 className="text-3xl font-bold mb-6">{tPage("checkoutTitle")}</h1>
      <p className="text-gray-600 mb-8">{tPage("checkoutDescription")}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Order Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <ul className="divide-y border rounded-lg">
            {cart.items.map((it: any) => {
              const itemName = it.name || it.product?.name || `Product ${it.productId}`;
              const itemPrice = it.price * it.quantity;
              
              return (
                <li key={it.id} className="p-4 flex items-center justify-between">
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

          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>
                {formatMoney({
                  amount: cart.total || cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                  currency,
                  locale: "en-CA",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="space-y-8">
          {/* Shipping Address */}
          <AddressForm
            title="Shipping Address"
            data={shippingAddress}
            onChange={setShippingAddress}
            errors={formErrors.shipping}
            showPhone={true}
          />

          {/* Billing Address */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="billingSameAsShipping"
                checked={billingSameAsShipping}
                onCheckedChange={(checked) => setBillingSameAsShipping(checked === true)}
              />
              <Label htmlFor="billingSameAsShipping" className="text-sm font-medium">
                {t("billingSameAsShipping")}
              </Label>
            </div>

            {!billingSameAsShipping && (
              <AddressForm
                title={t("billingAddressTitle")}
                data={billingAddress}
                onChange={setBillingAddress}
                errors={formErrors.billing}
                showPhone={false}
              />
            )}
          </div>

          {/* Payment Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
            {creatingPI && <div className="text-center py-4">Preparing payment…</div>}
            {clientSecret && options && (
              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm 
                  returnUrl={`${window.location.origin}/orders/thank-you`}
                  shippingAddress={shippingAddress}
                  billingAddress={billingSameAsShipping ? shippingAddress : billingAddress}
                  onValidationError={setFormErrors}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CheckoutFormProps {
  returnUrl: string;
  shippingAddress: AddressFormData;
  billingAddress: AddressFormData;
  onValidationError: (errors: {
    shipping?: Partial<AddressFormData>;
    billing?: Partial<AddressFormData>;
  }) => void;
}

function CheckoutForm({ returnUrl, shippingAddress, billingAddress, onValidationError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const t = useTranslations("/cart.page.stripePayment");

  const validateAddress = (address: AddressFormData): Partial<AddressFormData> => {
    const errors: Partial<AddressFormData> = {};
    
    if (!address.fullName.trim()) errors.fullName = "Name is required";
    if (!address.address1.trim()) errors.address1 = "Address is required";
    if (!address.city.trim()) errors.city = "City is required";
    if (!address.postalCode.trim()) errors.postalCode = "Postal code is required";
    if (!address.country.trim()) errors.country = "Country is required";
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate addresses
    const shippingErrors = validateAddress(shippingAddress);
    const billingErrors = validateAddress(billingAddress);
    
    if (Object.keys(shippingErrors).length > 0 || Object.keys(billingErrors).length > 0) {
      onValidationError({
        shipping: Object.keys(shippingErrors).length > 0 ? shippingErrors : undefined,
        billing: Object.keys(billingErrors).length > 0 ? billingErrors : undefined,
      });
      setMessage(t("fillRequiredFields"));
      return;
    }

    // Clear any previous validation errors
    onValidationError({});

    if (!stripe || !elements) return;

    setSubmitting(true);
    
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { 
          return_url: returnUrl,
          shipping: {
            name: shippingAddress.fullName,
            address: {
              line1: shippingAddress.address1,
              line2: shippingAddress.address2 || undefined,
              city: shippingAddress.city,
              state: shippingAddress.state || undefined,
              postal_code: shippingAddress.postalCode,
              country: shippingAddress.country,
            },
            phone: shippingAddress.phone || undefined,
          },
        },
      });
      
      if (error) {
        setMessage(error.message ?? t("unexpectedError"));
      }
    } catch (err) {
      setMessage(t("unexpectedError"));
    } finally {
      setSubmitting(false);
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
        {submitting ? "Processing…" : t("payNowButton")}
      </button>
      {message && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{message}</p>
        </div>
      )}
    </form>
  );
}
