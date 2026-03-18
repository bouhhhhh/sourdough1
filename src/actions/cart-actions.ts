"use server";

import { clearCartId, getCartId } from "@/lib/cart-cookies";
import { commerce } from "@/lib/commerce";

export async function clearCartAction(): Promise<void> {
  const cartId = await getCartId();
  if (!cartId) return;

  try {
    await commerce.cart.clear({ cartId });
    await clearCartId();
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
}
