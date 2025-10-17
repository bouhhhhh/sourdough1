// src/lib/commerce.ts
import "server-only";

/* =========================
 * Product mock
 * ========================= */
export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;         // major units (e.g., 49.99)
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
    price: 49.99,
    currency: "CAD",
    image: "/Starter.jpg",
    images: ["/Starter.jpg"],
    category: "recipes",
    description: "Premium sourdough starter for making artisan bread.",
    inStock: true,
    active: true,
  },
  {
    id: "p_1002",
    name: "Basic Sourdough Guide",
    slug: "basic-sourdough-guide",
    price: 19.99,
    currency: "CAD",
    image: "/Starter.jpg",
    images: ["/Starter.jpg"],
    category: "instructions",
    description: "Complete step-by-step guide for sourdough beginners.",
    inStock: true,
    active: true,
  },
  {
    id: "p_1003",
    name: "Advanced Techniques Manual",
    slug: "advanced-techniques-manual",
    price: 29.99,
    currency: "CAD",
    image: "/Starter.jpg",
    images: ["/Starter.jpg"],
    category: "instructions",
    description: "Master advanced sourdough techniques and troubleshooting.",
    inStock: true,
    active: true,
  },
  {
    id: "p_1004",
    name: "Pizza Dough Kit",
    slug: "pizza-dough-kit",
    price: 39.99,
    currency: "CAD",
    image: "/Starter.jpg",
    images: ["/Starter.jpg"],
    category: "recipes",
    description: "Everything you need for perfect sourdough pizza.",
    inStock: true,
    active: true,
  },
];

/* =========================
 * Product helpers
 * ========================= */
async function listProducts(opts?: { limit?: number; category?: string }) {
  const { limit = 6, category } = opts ?? {};
  let items = PRODUCTS;
  if (category) items = items.filter((p) => p.category === category);
  return items.slice(0, limit);
}

async function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug) ?? null;
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
    get: async ({ slug }: { slug: string }) => getProductBySlug(slug),
    // compat wrapper used by your sitemap/products page
    browse: async ({ first, category }: { first?: number; category?: string }) => {
      const data = await listProducts({ limit: first, category });
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

      const priceCents = Math.round(prod.price * 100);
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
      const item = cart.items.find(
        (i) => i.productId === variantId || i.productId === PRODUCTS.find(p => p.slug === variantId)?.id
      );
      if (!item) throw new Error("Item not found");
      item.quantity = Math.max(1, quantity);
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
