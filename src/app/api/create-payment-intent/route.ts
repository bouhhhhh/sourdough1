import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { commerce } from "@/lib/commerce";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-08-27.basil",
});

export async function POST(req: Request) {
	try {
		const { cartId: clientCartId } = (await req.json()) as { cartId?: string };

		// 1. Récupérer le cartId "officiel" depuis le cookie de session
		const cookieStore = await cookies();
		const sessionCartId = cookieStore.get("cart_id")?.value;

		// 2. LE TEST DE SÉCURITÉ : Comparaison
		if (!clientCartId || clientCartId !== sessionCartId) {
			return NextResponse.json({ error: "Unauthorized cart access" }, { status: 403 });
		}

		const cartId = clientCartId;

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
		console.error("Détails pour moi :", err);
		return NextResponse.json(
			{ error: "Transaction impossible. Veuillez rafraîchir votre panier." },
			{ status: 500 },
		);
	}
}
