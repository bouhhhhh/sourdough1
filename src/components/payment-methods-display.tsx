"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "@/i18n/client";

// Map Stripe payment method types to our image files
const PAYMENT_METHOD_IMAGES: Record<string, { image: string; alt: string }> = {
  visa: { image: "/images/payments/visa.svg", alt: "Visa" },
  mastercard: { image: "/images/payments/mastercard.svg", alt: "Mastercard" },
  amex: { image: "/images/payments/amex.svg", alt: "American Express" },
  google_pay: { image: "/images/payments/google_pay.svg", alt: "Google Pay" },
  klarna: { image: "/images/payments/klarna.svg", alt: "Klarna" },
  link: { image: "/images/payments/link.svg", alt: "Link" },
};

// Default payment methods - show these immediately
const DEFAULT_METHODS = ["visa", "mastercard", "amex", "google_pay", "klarna", "link"];

export function PaymentMethodsDisplay() {
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Global.payment");

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Always show the default methods for better performance and reliability
  const paymentMethods = DEFAULT_METHODS;

  // Show static content during SSR and after mounting
  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium">{t("acceptedMethods")}</span>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {DEFAULT_METHODS.map((methodType) => {
            const methodInfo = PAYMENT_METHOD_IMAGES[methodType];
            if (!methodInfo) return null;
            
            return (
              <Image
                key={methodType}
                src={methodInfo.image}
                alt={methodInfo.alt}
                width={48}
                height={32}
                className="h-8 w-12 object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium">{t("acceptedMethods")}</span>
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {paymentMethods.map((methodType) => {
          const methodInfo = PAYMENT_METHOD_IMAGES[methodType];
          if (!methodInfo) return null;
          
          return (
            <Image
              key={methodType}
              src={methodInfo.image}
              alt={methodInfo.alt}
              width={48}
              height={32}
              className="h-8 w-12 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          );
        })}
      </div>
    </div>
  );
}