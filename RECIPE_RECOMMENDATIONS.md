# Recipe Product Recommendation Component

## Overview
The `RecipeProductRecommendation` component displays a product recommendation within recipe pages, matching the design from the reference image.

## Usage

### In Recipe Data (recipes.json)
Add a `recommendedProduct` object to any recipe:

```json
{
  "id": "r_1003",
  "name": "Sourdough Starter Maintenance",
  "slug": "sourdough-starter-maintenance",
  ...
  "recommendedProduct": {
    "productId": "p_2004",
    "productName": "Digital Kitchen Scale",
    "productPrice": "29.99 $",
    "productImage": "/kitchen-scale.jpg",
    "productSlug": "digital-kitchen-scale",
    "productDescription": "Description of why this product helps with the recipe"
  }
}
```

### Component Props
```typescript
interface RecipeProductRecommendationProps {
  productId: string;           // Product ID from products.json
  productName: string;          // Display name
  productPrice: string;         // Formatted price (e.g., "29.99 $")
  productImage: string;         // Image path
  productSlug: string;          // URL slug for product page
  productDescription: string;   // Why this product helps with recipe
  sectionTitle?: string;        // Optional custom title (default: "To help you with this recipe")
}
```

### Manual Usage in Components
If you need to add product recommendations outside of recipe pages:

```tsx
import { RecipeProductRecommendation } from "@/components/recipe-product-recommendation";

<RecipeProductRecommendation
  productId="p_2004"
  productName="Digital Kitchen Scale"
  productPrice="29.99 $"
  productImage="/kitchen-scale.jpg"
  productSlug="digital-kitchen-scale"
  productDescription="Essential for accurate measurements in sourdough baking"
  sectionTitle="Recommended Equipment" // Optional
/>
```

## Design Features
- Responsive grid layout (vertical on mobile, horizontal on desktop)
- Product image with hover effect
- Clear pricing and description
- "SHOP NOW" call-to-action button
- Links to product detail page
- Neutral background to stand out on recipe pages

## New Shop Category
A "Shop" category has been added to the navigation containing cooking utensils and equipment:
- Professional Bread Lame
- Dutch Oven Cast Iron
- Banneton Proofing Basket Set
- Digital Kitchen Scale
- Bread Proofing Box
- Dough Scraper Set

All shop products are categorized with `"category": "shop"` in products.json.
