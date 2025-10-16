"use client";

import { getCartId, setCartId } from "./cart-cookies-client";

// Client-side cart operations that sync with server
export async function getCartClient() {
  const cartId = getCartId();
  if (!cartId) return null;

  try {
    // Call server action to get cart
    const response = await fetch('/api/cart', {
      method: 'GET',
      headers: {
        'x-cart-id': cartId,
      },
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}

export async function addToCartClient(variantId: string, quantity = 1) {
  const cartId = getCartId();
  
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cartId && { 'x-cart-id': cartId }),
      },
      body: JSON.stringify({ variantId, quantity }),
    });
    
    if (!response.ok) throw new Error('Failed to add to cart');
    
    const cart = await response.json() as { id: string };
    
    // Set cart ID if it's a new cart
    if (!cartId && cart.id) {
      setCartId(cart.id);
    }
    
    return cart;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}