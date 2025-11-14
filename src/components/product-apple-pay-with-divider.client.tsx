"use client";

import { useEffect, useRef } from "react";
import ProductApplePay from "./product-apple-pay.client";

interface ProductApplePayWithDividerProps {
  amount: number;
  currency: string;
  productId: string;
  productName: string;
  quantity?: number;
}

export function ProductApplePayWithDivider(props: ProductApplePayWithDividerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if Apple Pay button was rendered by looking for Stripe element
    const checkApplePayButton = () => {
      if (containerRef.current) {
        const stripeElement = containerRef.current.querySelector('.StripeElement');
        const divider = containerRef.current.querySelector('.apple-pay-divider');
        if (divider) {
          if (stripeElement) {
            (divider as HTMLElement).style.display = 'block';
          } else {
            (divider as HTMLElement).style.display = 'none';
          }
        }
      }
    };

    // Check immediately and after a short delay to ensure Stripe has rendered
    checkApplePayButton();
    const timer = setTimeout(checkApplePayButton, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="space-y-3">
      <ProductApplePay
        {...props}
        fallback={null}
      />
      
      {/* This divider will be shown/hidden based on whether Apple Pay button rendered */}
      <div className="apple-pay-divider" style={{ display: 'none' }}>
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-neutral-300"></div>
          <span className="flex-shrink mx-4 text-sm text-neutral-500">or</span>
          <div className="flex-grow border-t border-neutral-300"></div>
        </div>
      </div>
    </div>
  );
}
