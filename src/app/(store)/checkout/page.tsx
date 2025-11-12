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
import { Input } from "@/ui/shadcn/input";
import { RadioGroup, RadioGroupItem } from "@/ui/shadcn/radio-group";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface ShippingRate {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  serviceCode?: string;
}

export default function CheckoutPage() {
  const { cart } = useCart();
  const t = useTranslations("/cart.page.stripePayment");
  const tPage = useTranslations("/cart.page");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creatingPI, setCreatingPI] = useState(false);
  const currency = cart?.currency || "CAD";
  
  // Email and shipping state
  const [email, setEmail] = useState("");
  const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  
  // Address form state
  const [shippingAddress, setShippingAddress] = useState<AddressFormData>({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'CA',
    phone: '',
  });
  
  const [billingAddress, setBillingAddress] = useState<AddressFormData>({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'CA',
    phone: '',
  });
  
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [formErrors, setFormErrors] = useState<{
    shipping?: Partial<AddressFormData>;
    billing?: Partial<AddressFormData>;
    email?: string;
    shipping_selection?: string;
  }>({});
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Validation function
  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    
    // Validate email
    if (!email || !email.includes('@')) {
      errors.email = 'Valid email is required';
    }
    
    // Validate shipping address
    const shippingErrors: Partial<AddressFormData> = {};
    if (!shippingAddress.fullName) shippingErrors.fullName = 'Required';
    if (!shippingAddress.address1) shippingErrors.address1 = 'Required';
    if (!shippingAddress.city) shippingErrors.city = 'Required';
    if (!shippingAddress.state) shippingErrors.state = 'Required';
    if (!shippingAddress.postalCode) shippingErrors.postalCode = 'Required';
    if (!shippingAddress.country) shippingErrors.country = 'Required';
    
    // Check if shipping to Canada
    if (shippingAddress.country && shippingAddress.country !== 'CA') {
      shippingErrors.country = 'We only ship to Canada for now';
    }
    
    if (Object.keys(shippingErrors).length > 0) {
      errors.shipping = shippingErrors;
    }
    
    // Validate billing address if different from shipping
    if (!billingSameAsShipping) {
      const billingErrors: Partial<AddressFormData> = {};
      if (!billingAddress.fullName) billingErrors.fullName = 'Required';
      if (!billingAddress.address1) billingErrors.address1 = 'Required';
      if (!billingAddress.city) billingErrors.city = 'Required';
      if (!billingAddress.state) billingErrors.state = 'Required';
      if (!billingAddress.postalCode) billingErrors.postalCode = 'Required';
      if (!billingAddress.country) billingErrors.country = 'Required';
      
      if (Object.keys(billingErrors).length > 0) {
        errors.billing = billingErrors;
      }
    }
    
    // Validate shipping selection
    if (!selectedShipping) {
      errors.shipping_selection = 'Please select a shipping method';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (validateForm()) {
      setShowPaymentForm(true);
      // Scroll to payment section
      setTimeout(() => {
        document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.border-red-500');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Auto-open payment form when all fields are valid
  useEffect(() => {
    if (showPaymentForm) return; // Already showing payment form
    
    // Check if all required fields are filled
    const isEmailValid = email && email.includes('@');
    const isShippingComplete = 
      shippingAddress.fullName &&
      shippingAddress.address1 &&
      shippingAddress.city &&
      shippingAddress.state &&
      shippingAddress.postalCode &&
      shippingAddress.country === 'CA';
    const isShippingSelected = !!selectedShipping;
    const isBillingComplete = billingSameAsShipping || (
      billingAddress.fullName &&
      billingAddress.address1 &&
      billingAddress.city &&
      billingAddress.state &&
      billingAddress.postalCode &&
      billingAddress.country
    );
    
    if (isEmailValid && isShippingComplete && isShippingSelected && isBillingComplete) {
      setShowPaymentForm(true);
      // Clear any previous errors
      setFormErrors({});
    }
  }, [email, shippingAddress, billingAddress, billingSameAsShipping, selectedShipping, showPaymentForm]);

  // Sync billing address with shipping when checkbox is checked
  useEffect(() => {
    if (billingSameAsShipping) {
      setBillingAddress(shippingAddress);
    }
  }, [billingSameAsShipping, shippingAddress]);

  // Fetch shipping rates when address changes
  useEffect(() => {
    const fetchRates = async () => {
      if (!shippingAddress.postalCode || !shippingAddress.country) {
        setShippingRates([]);
        setSelectedShipping(null);
        return;
      }

      // Only allow shipping to Canada
      if (shippingAddress.country !== 'CA') {
        setShippingRates([]);
        setSelectedShipping(null);
        return;
      }

      setLoadingRates(true);
      try {
        const response = await fetch("/api/shipping-rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination: {
              postalCode: shippingAddress.postalCode,
              country: shippingAddress.country,
              city: shippingAddress.city,
              province: shippingAddress.state,
            },
            package: { weight: 1 }, // Default 1kg
          }),
        });

        if (response.ok) {
          const data = await response.json() as { rates: ShippingRate[] };
          const allRates = data.rates || [];
          
          if (allRates.length === 0) {
            setShippingRates([]);
            return;
          }
          
          // Find cheapest rate and xpresspost
          const cheapestRate = allRates.reduce((min, rate) => 
            rate.price < min.price ? rate : min);
          
          const xpresspostRate = allRates.find(rate => 
            (rate.serviceCode?.includes('XP')) || 
            rate.name.toLowerCase().includes('xpress'));
          
          // Create simplified rate list with free option and xpresspost
          const simplifiedRates: ShippingRate[] = [];
          
          simplifiedRates.push({
            ...cheapestRate,
            id: 'free',
            name: 'Free Shipping',
            price: 0,
          });
          
          if (xpresspostRate && xpresspostRate.id !== cheapestRate.id) {
            // Subtract $10 (1000 cents) from Xpresspost to make it more attractive
            simplifiedRates.push({
              ...xpresspostRate,
              price: Math.max(0, xpresspostRate.price - 1000),
              
            });
          }
          
          setShippingRates(simplifiedRates);
          // Auto-select free option
          if (simplifiedRates.length > 0) {
            setSelectedShipping(simplifiedRates[0] || null);
          }
        }
      } catch (error) {
        console.error("Error fetching shipping rates:", error);
      } finally {
        setLoadingRates(false);
      }
    };

    fetchRates();
  }, [shippingAddress.postalCode, shippingAddress.country, shippingAddress.city, shippingAddress.state]);

  useEffect(() => {
    (async () => {
      console.log("Checkout: cart from context:", cart);

      if (cart?.items && cart.items.length > 0) {
        console.log("Checkout: cart has items, creating payment intent...");
        
        // Calculate total from items (cart might not have total field)
        const subtotal = cart.total || cart.items.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);
        
        // Add shipping cost if selected
        const shippingCost = selectedShipping?.price || 0;
        const total = subtotal + shippingCost;
        
        console.log("Checkout: calculated subtotal:", subtotal, "shipping:", shippingCost, "total:", total, "currency:", currency);
        
        if (total > 0) {
          setCreatingPI(true);
          try {
            const res = await fetch("/api/create-payment-intent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: total,
                currency: (currency || "CAD").toLowerCase(),
                cartId: cart.id,
              }),
            });
            
            if (!res.ok) {
              const errorData = await res.json();
              console.error("Payment intent creation failed:", errorData);
              setClientSecret(null);
            } else {
              const data = (await res.json()) as { clientSecret?: string; orderNumber?: string };
              console.log("Payment intent created, clientSecret:", data.clientSecret ? "✓ present" : "✗ missing");
              console.log("Order number:", data.orderNumber);
              setClientSecret(data.clientSecret || null);
            }
          } catch (error) {
            console.error("Error creating payment intent:", error);
            setClientSecret(null);
          } finally {
            setCreatingPI(false);
          }
        } else {
          console.warn("Checkout: total is 0, not creating payment intent");
        }
      } else {
        console.log("Checkout: cart is empty or has no items");
      }
    })();
  }, [cart, currency, selectedShipping]);

  // Stripe options must be defined before any conditional returns
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

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">{tPage("checkoutTitle")}</h1>
      <p className="text-gray-600 mb-8">{tPage("checkoutDescription")}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Order Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-4">{tPage("orderSummary")}</h2>
          
          <ul className="divide-y border rounded-lg">
            {cart.items.map((it: any) => {
              const itemName = it.name || it.product?.name || `Product ${it.productId}`;
              const itemPrice = it.price * it.quantity;
              
              return (
                <li key={it.id} className="p-4 flex items-center justify-between">
                  <div className="mr-4">
                    <div className="font-medium">{itemName}</div>
                    <div className="text-sm text-gray-500">{tPage("quantity")}: {it.quantity}</div>
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
            <div className="flex items-center justify-between mb-2">
              <span>{tPage("subtotal")}</span>
              <span>
                {formatMoney({
                  amount: cart.total || cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                  currency,
                  locale: "en-CA",
                })}
              </span>
            </div>
            {selectedShipping && (
              <div className="flex items-center justify-between mb-2 text-sm">
                <span>{tPage("shipping")} ({selectedShipping.name})</span>
                <span>
                  {formatMoney({
                    amount: selectedShipping.price,
                    currency,
                    locale: "en-CA",
                  })}
                </span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex items-center justify-between text-lg font-semibold">
              <span>{tPage("total")}</span>
              <span>
                {formatMoney({
                  amount: (cart.total || cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)) + (selectedShipping?.price || 0),
                  currency,
                  locale: "en-CA",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="space-y-8">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-lg font-semibold mb-2 block">
              {tPage("emailAddress")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full ${formErrors.email ? "border-red-500" : ""}`}
            />
            {formErrors.email && (
              <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
            )}
            {!formErrors.email && (
              <p className="text-sm text-gray-500 mt-1">
                We'll send your order confirmation here
              </p>
            )}
          </div>

          {/* Shipping Address */}
          <AddressForm
            title={tPage("shippingAddress")}
            data={shippingAddress}
            onChange={setShippingAddress}
            errors={formErrors.shipping}
            showPhone={true}
          />

          {/* Shipping Rates Display */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{tPage("shippingMethod")}</h3>
            
            {loadingRates && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">{tPage("loadingShipping")}</p>
              </div>
            )}

            {!loadingRates && shippingRates.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">{tPage("shippingMethod")}</h4>
                <RadioGroup 
                  value={selectedShipping?.id || ""} 
                  onValueChange={(value) => {
                    const rate = shippingRates.find(r => r.id === value);
                    setSelectedShipping(rate || null);
                  }}
                >
                  {shippingRates.map((rate) => (
                    <div
                      key={rate.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedShipping(rate)}
                    >
                      <RadioGroupItem value={rate.id} id={`rate-${rate.id}`} />
                      <Label
                        htmlFor={`rate-${rate.id}`}
                        className="flex-1 cursor-pointer flex justify-between items-start"
                      >
                        <div>
                          <div className="font-medium">{rate.name}</div>
                          <div className="text-sm text-gray-500">{rate.estimatedDays}</div>
                        </div>
                        <div className="font-semibold">
                          {formatMoney({
                            amount: rate.price,
                            currency,
                            locale: "en-CA",
                          })}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {formErrors.shipping_selection && (
                  <p className="text-sm text-red-600 mt-2">{tPage("selectShipping")}</p>
                )}
              </div>
            )}

            {!loadingRates && shippingRates.length === 0 && shippingAddress.country && shippingAddress.country !== 'CA' && (
              <div className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="text-sm text-red-800 font-semibold">
                  {tPage("onlyCanada")}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {tPage("subscribeNewsletter")}
                </p>
              </div>
            )}

            {!loadingRates && shippingRates.length === 0 && shippingAddress.postalCode && shippingAddress.country === 'CA' && (
              <div className="mt-4 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <p className="text-sm text-yellow-800">
                  {tPage("completeAddress")}
                </p>
              </div>
            )}
          </div>

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

          {/* Continue to Payment Button */}
          {!showPaymentForm && (
            <div className="mt-6">
              <button
                onClick={handleContinueToPayment}
                className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                {tPage("continueToPayment")}
              </button>
            </div>
          )}

          {/* Payment Section */}
          {showPaymentForm && (
          <div id="payment-section">
            <h3 className="text-lg font-semibold mb-4">{tPage("paymentDetails")}</h3>
            {creatingPI && <div className="text-center py-4">Preparing payment…</div>}
            {clientSecret && options && (
              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm 
                  returnUrl={`${window.location.origin}/confirmation`}
                  customerEmail={email}
                  shippingAddress={shippingAddress}
                  billingAddress={billingSameAsShipping ? shippingAddress : billingAddress}
                  onValidationError={setFormErrors}
                />
              </Elements>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CheckoutFormProps {
  returnUrl: string;
  customerEmail: string;
  shippingAddress: AddressFormData;
  billingAddress: AddressFormData;
  onValidationError: (errors: {
    shipping?: Partial<AddressFormData>;
    billing?: Partial<AddressFormData>;
  }) => void;
}

function CheckoutForm({ returnUrl, customerEmail, shippingAddress, billingAddress, onValidationError }: CheckoutFormProps) {
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
          return_url: `${returnUrl}?email=${encodeURIComponent(customerEmail)}`,
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
