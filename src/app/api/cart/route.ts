import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { commerce } from "@/lib/commerce";

export async function setCardIdCookie(cartId: string) {
	const cookieStore = await cookies();

	cookieStore.set("cart_id", cartId, {
		httpOnly: true, // Bloque l'accès via JavaScript (XSS Protection)
		secure: true, // Uniquement via HTTPS
		sameSite: "lax", // Protection contre le CSRF
		path: "/", // Disponible sur tout le site
		maxAge: 60 * 60 * 24 * 30, // Expire après 30 jours
	});
}

export async function GET(request: NextRequest) {
	try {
		const cookieStore = await cookies();
		const cartId = cookieStore.get("cart_id")?.value;

		if (!cartId) {
			return NextResponse.json(null);
		}

		const cart = await commerce.cart.get({ cartId });
		return NextResponse.json(cart);
	} catch (error) {
		console.error("API Error fetching cart:", error);
		return NextResponse.json(null, { status: 500 });
	}
}

// Validation réutilisable
const isValidQuantity = (q: any) => Number.isInteger(q) && q >= 1 && q <= 100;

export async function POST(request: NextRequest) {
	try {
		const cookieStore = await cookies();
		const cartId = cookieStore.get("cart_id")?.value;

		const body = (await request.json()) as { variantId: string; quantity?: number };
		const { variantId, quantity = 1 } = body;

		// SÉCURITÉ : Bloquer les valeurs négatives ou absurdes
		if (!isValidQuantity(quantity)) {
			return NextResponse.json({ error: "Quantité invalide" }, { status: 400 });
		}

		const cart = await commerce.cart.add({ cartId, variantId, quantity });

		// Set cookie if one didn't exist
		if (!cartId && cart.id) {
			await setCardIdCookie(cart.id);
		}

		return NextResponse.json(cart);
	} catch (error) {
		console.error("API Error adding to cart:", error);
		return NextResponse.json({ error: "Failed to add" }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const cookieStore = await cookies();
		const cartId = cookieStore.get("cart_id")?.value;

		const body = (await request.json()) as { variantId: string; quantity: number };
		const { variantId, quantity } = body;

		// SÉCURITÉ : Crucial ici car c'est un UPDATE
		if (!cartId) return NextResponse.json({ error: "Cart ID required" }, { status: 400 });
		if (!isValidQuantity(quantity)) {
			return NextResponse.json({ error: "Quantité doit être entre 1 et 100" }, { status: 400 });
		}

		const cart = await commerce.cart.update({ cartId, variantId, quantity });
		return NextResponse.json(cart);
	} catch (error) {
		console.error("API Error updating cart:", error);
		return NextResponse.json({ error: "Update failed" }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const cookieStore = await cookies();
		const cartId = cookieStore.get("cart_id")?.value;

		if (!cartId) {
			return NextResponse.json({ error: "Cart ID required" }, { status: 400 });
		}

		const { searchParams } = new URL(request.url);
		const variantId = searchParams.get("variantId");

		if (!variantId) {
			return NextResponse.json({ error: "Variant ID required" }, { status: 400 });
		}

		console.log("Cart API - Removing from cart:", { cartId, variantId });

		const cart = await commerce.cart.remove({
			cartId,
			variantId,
		});

		console.log("Cart API - Remove success:", cart);
		return NextResponse.json(cart);
	} catch (error) {
		console.error("API Error removing from cart:", error);
		return NextResponse.json({ error: "Failed to remove from cart" }, { status: 500 });
	}
}
