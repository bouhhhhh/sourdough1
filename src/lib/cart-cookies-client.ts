import Cookies from "js-cookie";

export const CART_COOKIE = "yns_cart_id";

export function getCartId(): string | undefined {
  return Cookies.get(CART_COOKIE);
}

export function setCartId(cartId: string): void {
  Cookies.set(CART_COOKIE, cartId, {
    expires: 30, // days
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearCartId(): void {
  Cookies.remove(CART_COOKIE);
}