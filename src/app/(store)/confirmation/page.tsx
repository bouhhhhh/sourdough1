"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { YnsLink } from "@/ui/yns-link";
import { formatMoney } from "@/lib/utils";
import { clearCartAction } from "@/actions/cart-actions";
import { ShippingMap } from "@/components/shipping-map";
import { useLocale } from "@/i18n/client";

interface ShippingAddress {
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const { cart } = useCart();
  const locale = useLocale();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    // Get payment intent status from URL parameters
    const paymentIntent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    const customerEmail = searchParams.get('email');

    if (redirectStatus === 'succeeded' && paymentIntent) {
      // Fetch payment intent details from Stripe
      fetch(`/api/payment-intent?payment_intent=${paymentIntent}`)
        .then(res => res.json())
        .then((data: any) => {
          if (data.paymentIntent?.shipping) {
            setShippingAddress(data.paymentIntent.shipping);
            
            // Send confirmation email if we have all the data
            if (cart && !emailSent) {
              const orderNumber = `ORD-${Date.now()}`;
              const orderDate = new Date().toLocaleDateString();
              
              // Get email from URL or use a default
              const email = customerEmail || 'customer@example.com';
              
              fetch('/api/send-confirmation-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email,
                  orderNumber,
                  orderDate,
                  items: cart.items.map((item: any) => ({
                    name: item.name || item.product?.name || `Product ${item.productId}`,
                    quantity: item.quantity,
                    price: item.price,
                  })),
                  total: cart.total,
                  currency: cart.currency,
                  shippingAddress: data.paymentIntent.shipping,
                  locale, // Pass the current locale to the email API
                }),
              })
                .then(() => setEmailSent(true))
                .catch(error => console.error('Error sending confirmation email:', error));
            }
          }
        })
        .catch(error => console.error('Error fetching payment intent:', error));

      // Payment succeeded
      setPaymentStatus('succeeded');
      // Save order details before clearing cart
      if (cart) {
        setOrderDetails({
          items: cart.items,
          total: cart.total,
          currency: cart.currency,
          paymentIntent: paymentIntent,
          orderNumber: `ORD-${Date.now()}`, // Simple order number generation
          orderDate: new Date().toLocaleDateString(),
        });
        // Clear the cart after successful payment
        clearCartAction();
      }
    } else if (redirectStatus === 'failed') {
      // Payment failed - this shouldn't normally happen as failures 
      // should stay on checkout page
      setPaymentStatus('failed');
    }
  }, [searchParams, cart]);

  if (paymentStatus === 'loading') {
    return (
      <div className="container py-10 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Processing your order...</p>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="container py-10 text-center">
        <XCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-4 text-red-600">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          There was an issue processing your payment. Please try again.
        </p>
        <YnsLink 
          href="/checkout"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-6 font-medium text-white hover:bg-blue-700"
        >
          Try Again
        </YnsLink>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-6" />
        
        {/* Success Message */}
        <h1 className="text-3xl font-bold mb-4 text-green-600">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your order. We've received your payment and will process your order shortly.
        </p>


        {/* Shipping Address Map */}
        {shippingAddress && (
          <div className="mb-8">
            <ShippingMap 
              address={shippingAddress.address}
              name={shippingAddress.name}
            />
          </div>
        )}

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            
            <div className="space-y-2 mb-4">
              <p><strong>Order Number:</strong> {orderDetails.orderNumber}</p>
              <p><strong>Order Date:</strong> {orderDetails.orderDate}</p>
              <p><strong>Payment ID:</strong> {orderDetails.paymentIntent}</p>
            </div>

            <h3 className="font-semibold mb-2">Items Ordered:</h3>
            <ul className="divide-y border rounded-lg bg-white">
              {orderDetails.items.map((item: any) => {
                const itemName = item.name || item.product?.name || `Product ${item.productId}`;
                const itemPrice = item.price * item.quantity;
                
                return (
                  <li key={item.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{itemName}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      {formatMoney({
                        amount: itemPrice,
                        currency: orderDetails.currency,
                        locale: "en-CA",
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 p-3 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center justify-between text-lg font-semibold text-green-800">
                <span>Total Paid:</span>
                <span>
                  {formatMoney({
                    amount: orderDetails.total,
                    currency: orderDetails.currency,
                    locale: "en-CA",
                  })}
                </span>
              </div>
            </div>
          </div>
        )}


        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• You'll receive an order confirmation email shortly</li>
            <li>• We'll prepare your sourdough items with care</li>
            <li>• You'll get a shipping notification when your order is sent</li>
            <li>• Estimated delivery: 3-5 business days</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <YnsLink 
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-gray-600 px-6 font-medium text-white hover:bg-gray-700 w-full sm:w-auto"
          >
            Continue Shopping
          </YnsLink>
          <YnsLink 
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-6 font-medium text-white hover:bg-blue-700 w-full sm:w-auto"
          >
            Back to Home
          </YnsLink>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container py-10 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}