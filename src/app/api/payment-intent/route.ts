import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	// Use the API version that matches the installed Stripe types.
	// The TypeScript types currently expect "2025-08-27.basil".
	apiVersion: "2025-08-27.basil",
	typescript: true,
});

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const paymentIntentId = searchParams.get("payment_intent");

		if (!paymentIntentId) {
			return NextResponse.json(
				{ error: "Payment intent ID is required" },
				{ status: 400 }
			);
		}

		// Retrieve the payment intent from Stripe
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		return NextResponse.json({
			paymentIntent: {
				id: paymentIntent.id,
				amount: paymentIntent.amount,
				currency: paymentIntent.currency,
				status: paymentIntent.status,
				shipping: paymentIntent.shipping,
			},
		});
	} catch (error: unknown) {
		console.error("Error retrieving payment intent:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve payment intent" },
			{ status: 500 }
		);
	}
}
