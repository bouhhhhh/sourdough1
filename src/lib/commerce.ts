// src/lib/commerce.ts
import "server-only";
import path from "path";
import fs from "fs";

// Load translations from JSON files
function loadTranslations(locale: string): Record<string, string> {
	const messagesPath = path.join(process.cwd(), "messages", `${locale}.json`);
	try {
		const content = fs.readFileSync(messagesPath, "utf-8");
		return JSON.parse(content) as Record<string, string>;
	} catch (error) {
		console.error(`Failed to load translations for ${locale}:`, error);
		// Fallback to en-US
		const fallbackPath = path.join(process.cwd(), "messages", "en-US.json");
		const fallbackContent = fs.readFileSync(fallbackPath, "utf-8");
		return JSON.parse(fallbackContent) as Record<string, string>;
	}
}

/* =========================
 * Product mock
 * ========================= */
export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;         // major units (e.g., 49.99)
  discountedPrice?: number; // optional discounted price
  currency: "CAD";       // uppercase
  image: string;
  images: string[];
  category: string;
  description?: string;
  inStock: boolean;
  active: boolean;
};

const PRODUCTS: Product[] = [
  {
    id: "p_1001",
    name: "Sourdough Starter",
    slug: "sourdough-starter",
    discountedPrice: 14.99,
    price: 20.00,
    currency: "CAD",
    image: "/Starter.jpg",
    images: ["/Starter.jpg"],
    category: "products",
    description: "Premium sourdough starter for making artisan bread.",
    inStock: true,
    active: true,
  },
  {
    id: "p_1002",
    name: "Beginner's Guide to Sourdough",
    slug: "beginners-guide-to-sourdough",
    price: 12.99,
    discountedPrice: 9.99,
    currency: "CAD",
    image: "/Starter.jpg",
    images: ["/Starter.jpg"],
    category: "products",
    description: "Complete step-by-step guide for sourdough beginners.",
    inStock: true,
    active: true,
  },
  {
    id: "p_1003",
    name: "Pizza Recipe",
    slug: "pizza-recipe",
    price: 8.99,
    currency: "CAD",
    image: "/pizzarecipe.jpg",
    images: ["/pizzarecipe.jpg"],
    category: "recipes",
    description: "Authentic sourdough pizza recipe with step-by-step instructions.",
    inStock: true,
    active: true,
  },
  {
    id: "p_1004",
    name: "Loaf Recipe",
    slug: "loaf-recipe",
    price: 6.99,
    currency: "CAD",
    image: "/recipe.webp",
    images: ["/recipe.webp"],
    category: "recipes",
    description: "Classic sourdough bread loaf recipe for perfect homemade bread.",
    inStock: true,
    active: true,
  },
];

/* =========================
 * Product helpers
 * ========================= */
// Helper to translate a product
function translateProduct(product: Product, locale: string = "en-US"): Product {
  const messages = loadTranslations(locale);
  const nameKey = `Products.${product.id}.name`;
  const descKey = `Products.${product.id}.description`;
  
  return {
    ...product,
    name: messages[nameKey] || product.name,
    description: messages[descKey] || product.description,
  };
}

async function listProducts(opts?: { limit?: number; category?: string; locale?: string }) {
  const { limit = 6, category, locale = "en-US" } = opts ?? {};
  let items = PRODUCTS;
  if (category) items = items.filter((p) => p.category === category);
  const sliced = items.slice(0, limit);
  return sliced.map(p => translateProduct(p, locale));
}

async function getProductBySlug(slug: string, locale: string = "en-US") {
  const product = PRODUCTS.find((p) => p.slug === slug);
  return product ? translateProduct(product, locale) : null;
}

async function listCategories() {
  return Array.from(new Set(PRODUCTS.map((p) => p.category)));
}

/* =========================
 * In-memory cart
 * ========================= */
// Store cents in cart to play nicely with formatters expecting integers
export type CartItem = {
  id: string;          // line item id
  productId: string;
  variantId?: string;  // for compatibility with cart context
  name?: string;       // optional for compatibility
  price: number;       // cents
  quantity: number;
  image?: string;
  product?: any;       // for compatibility with cart context
};

export type Cart = {
  id: string;
  items: CartItem[];
  currency: "CAD" | "USD" | "EUR";
  subtotal: number;    // cents
  total: number;       // cents - for compatibility with checkout page
};

const carts = new Map<string, Cart>();

function computeSubtotal(items: CartItem[]) {
  return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
}

function ensureCart(id?: string): Cart {
  const cartId = id || `cart_${Math.random().toString(36).slice(2, 9)}`;
  let cart = carts.get(cartId);
  if (!cart) {
    cart = { id: cartId, items: [], currency: "CAD", subtotal: 0, total: 0 };
    carts.set(cartId, cart);
  }
  const subtotal = computeSubtotal(cart.items);
  cart.subtotal = subtotal;
  cart.total = subtotal; // For now, total equals subtotal (no shipping/tax)
  return cart;
}

/* =========================
 * Public API
 * ========================= */
export const commerce = {
  product: {
    list: listProducts,
    get: async ({ slug, locale }: { slug: string; locale?: string }) => getProductBySlug(slug, locale),
    // compat wrapper used by your sitemap/products page
    browse: async ({ first, category, locale }: { first?: number; category?: string; locale?: string }) => {
      const data = await listProducts({ limit: first, category, locale });
      return { data };
    },
  },

  category: {
    list: listCategories,
  },

  cart: {
    // Matches your usage: await commerce.cart.get({ cartId })
    async get({ cartId }: { cartId: string }): Promise<Cart> {
      const cart = ensureCart(cartId);
      const subtotal = computeSubtotal(cart.items);
      cart.subtotal = subtotal;
      cart.total = subtotal;
      return cart;
    },

    // Matches: await commerce.cart.add({ cartId?, variantId, quantity })
    async add({
      cartId,
      variantId,
      quantity = 1,
    }: {
      cartId?: string;
      variantId: string;  // here we treat variantId as product id/slug
      quantity?: number;
    }): Promise<Cart> {
      const cart = ensureCart(cartId);

      // find product by id OR slug
      const prod =
        PRODUCTS.find((p) => p.id === variantId || p.slug === variantId) ?? null;
      if (!prod) throw new Error("Product not found");

      const priceCents = Math.round((prod.discountedPrice || prod.price) * 100);
      const existing = cart.items.find((i) => i.productId === prod.id);

      if (existing) {
        existing.quantity += Math.max(1, quantity);
      } else {
        cart.items.push({
          id: `li_${Math.random().toString(36).slice(2, 9)}`,
          productId: prod.id,
          variantId: variantId, // use the passed variantId
          name: prod.name,
          price: priceCents,
          quantity: Math.max(1, quantity),
          image: prod.images?.[0],
          product: {
            id: prod.id,
            name: prod.name,
            images: prod.images,
          },
        });
      }

      const subtotal = computeSubtotal(cart.items);
      cart.subtotal = subtotal;
      cart.total = subtotal;
      return cart;
    },

    // Matches: await commerce.cart.update({ cartId, variantId, quantity })
    async update({
      cartId,
      variantId,
      quantity,
    }: {
      cartId: string;
      variantId: string; // product id/slug
      quantity: number;
    }): Promise<Cart> {
      const cart = ensureCart(cartId);
      
      // If quantity is 0 or less, remove the item
      if (quantity <= 0) {
        const pid =
          PRODUCTS.find((p) => p.id === variantId || p.slug === variantId)?.id ??
          variantId;
        cart.items = cart.items.filter((i) => i.productId !== pid);
        const subtotal = computeSubtotal(cart.items);
        cart.subtotal = subtotal;
        cart.total = subtotal;
        return cart;
      }
      
      const item = cart.items.find(
        (i) => i.productId === variantId || i.productId === PRODUCTS.find(p => p.slug === variantId)?.id
      );
      if (!item) throw new Error("Item not found");
      item.quantity = quantity;
      const subtotal = computeSubtotal(cart.items);
      cart.subtotal = subtotal;
      cart.total = subtotal;
      return cart;
    },

    // Matches: await commerce.cart.remove({ cartId, variantId })
    async remove({
      cartId,
      variantId,
    }: {
      cartId: string;
      variantId: string; // product id/slug
    }): Promise<Cart> {
      const cart = ensureCart(cartId);
      const pid =
        PRODUCTS.find((p) => p.id === variantId || p.slug === variantId)?.id ??
        variantId;
      cart.items = cart.items.filter((i) => i.productId !== pid);
      const subtotal = computeSubtotal(cart.items);
      cart.subtotal = subtotal;
      cart.total = subtotal;
      return cart;
    },

    // Matches: await commerce.cart.clear({ cartId })
    async clear({ cartId }: { cartId: string }): Promise<Cart> {
      const cart = ensureCart(cartId);
      cart.items = [];
      cart.subtotal = 0;
      cart.total = 0;
      return cart;
    },
  },
};

export { listProducts, getProductBySlug, listCategories };
