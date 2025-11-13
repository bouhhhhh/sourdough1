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

		console.log("[PAYMENT-INTENT] Request received for:", paymentIntentId);

		if (!paymentIntentId) {
			return NextResponse.json(
				{ error: "Payment intent ID is required" },
				{ status: 400 }
			);
		}

		// Retrieve the payment intent from Stripe
		const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

		console.log("[PAYMENT-INTENT] Retrieved from Stripe:", {
			id: paymentIntent.id,
			amount: paymentIntent.amount,
			status: paymentIntent.status,
			metadata: paymentIntent.metadata,
		});

		// Trigger confirmation email from server if not already sent
		const meta = paymentIntent.metadata || {};
		const payerEmail = meta.payerEmail;
		
		if (paymentIntent.status === "succeeded" && payerEmail && !meta.emailSent) {
			console.log("[PAYMENT-INTENT] Triggering confirmation email to:", payerEmail);
			
			// Fire-and-forget email send
			(async () => {
				try {
					const orderNumber = meta.orderNumber || `ORD-${Date.now()}`;
					const orderDate = new Date().toLocaleDateString();
					const productName = meta.productName || `Product ${meta.productId || ''}`;
					const quantity = Number(meta.quantity || 1);
					const productAmount = Number(meta.productAmount || 0);

					const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL}` || 'http://localhost:3000';
					
					const emailResponse = await fetch(`${baseUrl}/api/send-confirmation-email`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							email: payerEmail,
							orderNumber,
							orderDate,
							items: [{
								name: productName,
								quantity,
								price: Math.round(productAmount / Math.max(quantity, 1)),
							}],
							total: paymentIntent.amount,
							currency: paymentIntent.currency.toUpperCase(),
							shippingAddress: paymentIntent.shipping || undefined,
							locale: 'en-US',
						}),
					});

					console.log("[PAYMENT-INTENT] Email API response:", emailResponse.status);
					
					if (emailResponse.ok) {
						// Mark email as sent in metadata
						await stripe.paymentIntents.update(paymentIntentId, {
							metadata: { ...meta, emailSent: 'true' }
						});
						console.log("[PAYMENT-INTENT] Email sent successfully and metadata updated");
					} else {
						const errorData = await emailResponse.json();
						console.error("[PAYMENT-INTENT] Email API error:", errorData);
					}
				} catch (e) {
					console.error("[PAYMENT-INTENT] Email send error:", e);
				}
			})();
		} else {
			console.log("[PAYMENT-INTENT] Not sending email:", {
				status: paymentIntent.status,
				hasEmail: !!payerEmail,
				alreadySent: meta.emailSent === 'true',
			});
		}

		return NextResponse.json({
			paymentIntent: {
				id: paymentIntent.id,
				amount: paymentIntent.amount,
				currency: paymentIntent.currency,
				status: paymentIntent.status,
				shipping: paymentIntent.shipping,
				metadata: paymentIntent.metadata,
			},
		});
	} catch (error: unknown) {
		console.error("[PAYMENT-INTENT] Error retrieving payment intent:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve payment intent" },
			{ status: 500 }
		);
	}
}
