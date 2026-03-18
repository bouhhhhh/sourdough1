import { NextResponse } from "next/server";
import Stripe from "stripe";
import { commerce } from "@/lib/commerce";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {
	try {
		const { cartId } = (await req.json()) as { cartId?: string };

		if (!cartId) {
			return NextResponse.json({ error: "Missing cartId" }, { status: 400 });
		}

		const cart = await commerce.cart.get({ cartId });
		if (!cart || cart.items.length === 0) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		const amount = cart.total;

		if (!Number.isInteger(amount) || amount <= 0) {
			return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
		}

		// Generate order number
		const orderNumber = `ORD-${Date.now()}`;

		const pi = await stripe.paymentIntents.create(
			{
				amount, // cents
				currency: "cad",
				automatic_payment_methods: { enabled: true }, // Payment Element
				metadata: {
					cartId: String(cartId ?? ""),
					orderNumber: orderNumber,
				},
			},
			{
				idempotencyKey: `${cartId}_${amount}`,
			},
		);

		return NextResponse.json({ clientSecret: pi.client_secret, orderNumber });
	} catch (err: any) {
		console.error("create-payment-intent error:", err);
		return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
	}
}
