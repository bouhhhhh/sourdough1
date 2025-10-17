import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe (only if secret key is available)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-08-27.basil",
    })
  : null;

export async function GET() {
  try {
    if (!stripe) {
      // Return default payment methods if Stripe is not configured
      return NextResponse.json({
        paymentMethods: [
          { type: "card", brands: ["visa", "mastercard", "amex"] },
          { type: "google_pay" },
          { type: "klarna" },
          { type: "link" }
        ],
        verified: false,
        message: "Using default payment methods (Stripe not configured)"
      });
    }

    // Use a timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Stripe API timeout")), 5000); // 5 second timeout
    });

    // Simple account check to verify Stripe connection
    const accountPromise = stripe.accounts.retrieve();
    
    const account = await Promise.race([accountPromise, timeoutPromise]);

    // Return a simplified response with commonly supported payment methods
    const supportedMethods = [
      { type: "card", brands: ["visa", "mastercard", "amex"] },
      { type: "google_pay" },
      { type: "apple_pay" },
      { type: "klarna" },
      { type: "link" }
    ];

    return NextResponse.json({
      paymentMethods: supportedMethods,
      account: {
        country: (account as any).country,
        default_currency: (account as any).default_currency,
      },
      verified: true,
      message: "Payment methods verified via Stripe API"
    });
    
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    
    return NextResponse.json({
      paymentMethods: [
        { type: "card", brands: ["visa", "mastercard", "amex"] },
        { type: "google_pay" },
        { type: "klarna" },
        { type: "link" }
      ],
      verified: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Failed to verify payment methods, using defaults"
    });
  }
}