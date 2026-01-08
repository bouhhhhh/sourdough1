// src/lib/commerce.ts
import "server-only";
import path from "path";
import fs from "fs";
import type { Product, Recipe, ProductOrRecipe } from "./product-utils";
import { isProduct } from "./product-utils";

// Re-export types for convenience
export type { Product, Recipe, ProductOrRecipe } from "./product-utils";
export { isProduct, isRecipe } from "./product-utils";

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
 * Product & Recipe data
 * ========================= */
// Load products and recipes from JSON files
function loadProducts(): Product[] {
	const productsPath = path.join(process.cwd(), "src", "data", "products.json");
	try {
		const content = fs.readFileSync(productsPath, "utf-8");
		return JSON.parse(content) as Product[];
	} catch (error) {
		console.error("Failed to load products:", error);
		return [];
	}
}

function loadRecipes(): Recipe[] {
	const recipesPath = path.join(process.cwd(), "src", "data", "recipes.json");
	try {
		const content = fs.readFileSync(recipesPath, "utf-8");
		return JSON.parse(content) as Recipe[];
	} catch (error) {
		console.error("Failed to load recipes:", error);
		return [];
	}
}

const PRODUCTS: Product[] = loadProducts();
const RECIPES: Recipe[] = loadRecipes();

/* =========================
 * Product & Recipe helpers
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

// Helper to translate a recipe
function translateRecipe(recipe: Recipe, locale: string = "en-US"): Recipe {
  const messages = loadTranslations(locale);
  const nameKey = `Products.${recipe.id}.name`;
  const descKey = `Products.${recipe.id}.description`;
  
  return {
    ...recipe,
    name: messages[nameKey] || recipe.name,
    description: messages[descKey] || recipe.description,
  };
}

// Helper to translate any item (product or recipe)
function translateItem(item: ProductOrRecipe, locale: string = "en-US"): ProductOrRecipe {
  if (isProduct(item)) {
    return translateProduct(item, locale);
  }
  return translateRecipe(item, locale);
}

async function listProducts(opts?: { limit?: number; category?: string; locale?: string }) {
  const { limit = 6, category, locale = "en-US" } = opts ?? {};
  let items = PRODUCTS;
  if (category) items = items.filter((p) => p.category === category);
  const sliced = items.slice(0, limit);
  return sliced.map(p => translateProduct(p, locale));
}

async function listRecipes(opts?: { limit?: number; locale?: string }) {
  const { limit = 6, locale = "en-US" } = opts ?? {};
  const sliced = RECIPES.slice(0, limit);
  return sliced.map(r => translateRecipe(r, locale));
}

async function listAllItems(opts?: { limit?: number; category?: string; locale?: string }): Promise<ProductOrRecipe[]> {
  const { limit, category, locale = "en-US" } = opts ?? {};
  
  let items: ProductOrRecipe[] = [];
  
  if (!category) {
    // If no category specified, return all products and recipes
    items = [...PRODUCTS, ...RECIPES];
  } else if (category === "recipes") {
    // Only recipes
    items = [...RECIPES];
  } else {
    // For "products", "shop-accessories", or any other category, filter products by category
    items = PRODUCTS.filter((p) => p.category === category);
  }
  
  const translated = items.map(item => translateItem(item, locale));
  
  if (limit) {
    return translated.slice(0, limit);
  }
  
  return translated;
}

async function getProductBySlug(slug: string, locale: string = "en-US"): Promise<Product | null> {
  const product = PRODUCTS.find((p) => p.slug === slug);
  return product ? translateProduct(product, locale) : null;
}

async function getRecipeBySlug(slug: string, locale: string = "en-US"): Promise<Recipe | null> {
  const recipe = RECIPES.find((r) => r.slug === slug);
  return recipe ? translateRecipe(recipe, locale) : null;
}

async function getItemBySlug(slug: string, locale: string = "en-US"): Promise<ProductOrRecipe | null> {
  const product = await getProductBySlug(slug, locale);
  if (product) return product;
  
  const recipe = await getRecipeBySlug(slug, locale);
  return recipe;
}

async function listCategories() {
  const allItems: ProductOrRecipe[] = [...PRODUCTS, ...RECIPES];
  return Array.from(new Set(allItems.map((item) => item.category)));
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

  recipe: {
    list: listRecipes,
    get: async ({ slug, locale }: { slug: string; locale?: string }) => getRecipeBySlug(slug, locale),
    browse: async ({ first, locale }: { first?: number; locale?: string }) => {
      const data = await listRecipes({ limit: first, locale });
      return { data };
    },
  },

  item: {
    // Get any item (product or recipe)
    get: async ({ slug, locale }: { slug: string; locale?: string }) => getItemBySlug(slug, locale),
    list: listAllItems,
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

export { 
  listProducts, 
  listRecipes,
  listAllItems,
  getProductBySlug, 
  getRecipeBySlug,
  getItemBySlug,
  listCategories 
};
