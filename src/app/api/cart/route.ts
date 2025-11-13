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

    console.log("Cart API - Adding to cart:", { cartId, variantId, quantity });

    const cart = await commerce.cart.add({
      cartId,
      variantId,
      quantity,
    });

    console.log("Cart API - Success:", cart);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("API Error adding to cart:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cartId = request.headers.get('x-cart-id');
    
    if (!cartId) {
      return NextResponse.json({ error: "Cart ID required" }, { status: 400 });
    }

    const body = await request.json() as { variantId: string; quantity: number };
    const { variantId, quantity } = body;

    console.log("Cart API - Updating cart:", { cartId, variantId, quantity });

    const cart = await commerce.cart.update({
      cartId,
      variantId,
      quantity,
    });

    console.log("Cart API - Update success:", cart);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("API Error updating cart:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cartId = request.headers.get('x-cart-id');
    
    if (!cartId) {
      return NextResponse.json({ error: "Cart ID required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variantId');
    
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