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

export async function updateCartItemClient(variantId: string, quantity: number) {
  const cartId = getCartId();
  
  if (!cartId) {
    throw new Error('No cart ID found');
  }
  
  try {
    const response = await fetch('/api/cart', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-cart-id': cartId,
      },
      body: JSON.stringify({ variantId, quantity }),
    });
    
    if (!response.ok) throw new Error('Failed to update cart');
    
    return await response.json();
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
}

export async function removeFromCartClient(variantId: string) {
  const cartId = getCartId();
  
  if (!cartId) {
    throw new Error('No cart ID found');
  }
  
  try {
    const response = await fetch(`/api/cart?variantId=${encodeURIComponent(variantId)}`, {
      method: 'DELETE',
      headers: {
        'x-cart-id': cartId,
      },
    });
    
    if (!response.ok) throw new Error('Failed to remove from cart');
    
    return await response.json();
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
}