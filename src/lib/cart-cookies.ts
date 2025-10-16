import { cookies } from "next/headers";

export const CART_COOKIE = "yns_cart_id";

export async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value;
}

export async function setCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, cartId, {
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, // Allow client-side access for cart context
  });
}

export async function clearCartId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE);
}
