import { NextRequest, NextResponse } from "next/server";
import { commerce } from "@/lib/commerce";

export async function GET(request: NextRequest) {
  try {
    const cartId = request.headers.get('x-cart-id');
    
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

export async function POST(request: NextRequest) {
  try {
    const cartId = request.headers.get('x-cart-id') || undefined;
    const body = await request.json() as { variantId: string; quantity?: number };
    const { variantId, quantity = 1 } = body;

    const cart = await commerce.cart.add({
      cartId,
      variantId,
      quantity,
    });

    return NextResponse.json(cart);
  } catch (error) {
    console.error("API Error adding to cart:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}