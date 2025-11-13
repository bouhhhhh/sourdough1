# Product & Recipe Refactoring Summary

## Overview
Refactored the application to separate **Products** (items with prices that can be purchased) from **Recipes** (free content without prices).

## Changes Made

### 1. Type System (`src/lib/commerce.ts`)

#### New Types:
- **`Product`**: Items that can be purchased
  - Has `price`, `discountedPrice`, `currency`, `inStock`
  - Category: `"products"`
  - Type discriminator: `type: "product"`

- **`Recipe`**: Free content (no prices)
  - No price-related fields
  - Category: `"recipes"`
  - Type discriminator: `type: "recipe"`

- **`ProductOrRecipe`**: Union type for items that can be displayed

#### Type Guards:
```typescript
isProduct(item: ProductOrRecipe): item is Product
isRecipe(item: ProductOrRecipe): item is Recipe
```

### 2. Data Structure

#### Products (with prices):
- `p_1001` - Sourdough Starter ($14.99, discounted from $20.00)
- `p_1002` - Beginner's Guide to Sourdough ($9.99, discounted from $12.99)

#### Recipes (free):
- `r_1001` - Pizza Recipe
- `r_1002` - Loaf Recipe

### 3. API Methods

#### New Commerce API Methods:
```typescript
commerce.recipe.list({ limit, locale })
commerce.recipe.get({ slug, locale })
commerce.recipe.browse({ first, locale })

commerce.item.get({ slug, locale })  // Returns Product | Recipe
commerce.item.list({ limit, category, locale })  // Returns both
```

#### Existing (updated):
```typescript
commerce.product.list()  // Only returns products
commerce.product.get()   // Only returns products
```

### 4. UI Components

#### ProductCard (`src/ui/products/product-card.tsx`)
- **Now accepts**: `ProductOrRecipe` instead of just `Product`
- **Smart routing**: `/product/{slug}` for products, `/recipe/{slug}` for recipes
- **Conditional rendering**:
  - Shows "Add to Cart" button only for products
  - Shows "Free Recipe" badge for recipes
  - Shows price/discount only for products

### 5. Routes

#### New Recipe Page: `/src/app/(store)/recipe/[slug]/page.tsx`
- Similar layout to product page
- No pricing information
- Shows "Free Recipe" badge
- Breadcrumb navigation to `/recipes`
- Info box explaining it's a free recipe

### 6. Translations

#### English (`messages/en-US.json`):
```json
"/recipe.metadata.title": "{recipeName} · HeirBloom"
"/recipe.page.allRecipes": "All recipes"
"/recipe.page.aboutThisRecipe": "About this Recipe"
"/recipe.page.recipeNote": "This is a free recipe..."
"Products.r_1001.name": "Pizza Recipe"
"Products.r_1002.name": "Loaf Recipe"
```

#### French (`messages/fr-CA.json`):
```json
"/recipe.page.allRecipes": "Toutes les recettes"
"Products.r_1001.name": "Recette de Pizza"
"Products.r_1002.name": "Recette de Pain"
```

### 7. Cart System

**Important**: Cart only works with products!
- `commerce.cart.add()` only accepts products (validated by ID lookup in PRODUCTS array)
- Recipes cannot be added to cart
- Recipes don't have prices, so they can't be purchased

## Usage Examples

### Listing All Items
```typescript
// List only products
const products = await commerce.product.list({ limit: 10, locale });

// List only recipes
const recipes = await commerce.recipe.list({ limit: 10, locale });

// List both products and recipes
const allItems = await commerce.item.list({ limit: 10, locale });

// List by category
const products = await commerce.item.list({ category: "products" });
const recipes = await commerce.item.list({ category: "recipes" });
```

### Getting a Single Item
```typescript
// Get product
const product = await commerce.product.get({ slug: "sourdough-starter" });

// Get recipe
const recipe = await commerce.recipe.get({ slug: "pizza-recipe" });

// Get any item (returns Product | Recipe | null)
const item = await commerce.item.get({ slug: "pizza-recipe" });
if (item && isProduct(item)) {
  // Handle product
  console.log(item.price);
} else if (item && isRecipe(item)) {
  // Handle recipe
  console.log("Free recipe!");
}
```

### Using in Components
```tsx
import { isProduct } from "@/lib/commerce";

function ItemCard({ item }: { item: ProductOrRecipe }) {
  const isProductItem = isProduct(item);
  
  return (
    <div>
      <h2>{item.name}</h2>
      {isProductItem && <p>Price: ${item.price}</p>}
      {!isProductItem && <span>Free Recipe</span>}
    </div>
  );
}
```

## Migration Notes

### Breaking Changes:
1. **Type changes**: Components expecting `Product` now need to handle `ProductOrRecipe`
2. **ID format**: Products use `p_*` prefix, recipes use `r_*` prefix
3. **Routes**: Recipes now use `/recipe/[slug]` instead of `/product/[slug]`

### Safe Changes:
- All existing product functionality remains unchanged
- Cart system still works the same (products only)
- Existing product pages work identically

## Future Enhancements

Potential improvements:
1. Add recipe difficulty levels
2. Add cooking time fields to recipes
3. Add ingredients list to recipe type
4. Add recipe categories (pizza, bread, pastry, etc.)
5. Add recipe ratings/reviews
6. Create a dedicated `/recipes` page listing all recipes
7. Add recipe search functionality

## Testing Checklist

- [ ] Products display correctly with prices
- [ ] Recipes display correctly with "Free Recipe" badge
- [ ] Product cards show "Add to Cart" only for products
- [ ] Recipe cards don't show "Add to Cart"
- [ ] Product pages work at `/product/{slug}`
- [ ] Recipe pages work at `/recipe/{slug}`
- [ ] Cart only accepts products (not recipes)
- [ ] Translations work for both products and recipes
- [ ] Category filtering works correctly
