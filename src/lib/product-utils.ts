// src/lib/product-utils.ts
// Shared utilities that can be used in both client and server components

/* =========================
 * Product & Recipe types
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
  category: "products";  // Only products category
  description?: string;
  ingredients?: string;  // Ingredients list
  sections?: {           // Additional product sections
    title: string;
    content: string;
  }[];
  details?: {            // Product details/notes
    label: string;
    value: string;
  }[];
  bestSeller?: boolean;  // Best seller badge
  inStock: boolean;
  active: boolean;
  type: "product";       // Discriminator
};

export type Recipe = {
  id: string;
  name: string;
  slug: string;
  image: string;
  images: string[];
  category: "recipes";   // Only recipes category
  description?: string;
  active: boolean;
  type: "recipe";        // Discriminator
};

// Union type for items that can be displayed
export type ProductOrRecipe = Product | Recipe;

// Type guard functions
export function isProduct(item: ProductOrRecipe): item is Product {
  return item.type === "product";
}

export function isRecipe(item: ProductOrRecipe): item is Recipe {
  return item.type === "recipe";
}
