const RecipesImage = "/recipe.webp";
const ProductsImage = "/Starter.jpg";
const ShopImage = "/sourdough-kit.webp";

export const config = {
	categories: [
		{ name: "Products", slug: "products", image: ProductsImage },
		{ name: "Recipes", slug: "recipes", image: RecipesImage },
		{ name: "Shop Accessories", slug: "shop-accessories", image: ShopImage },
	],

	social: {
		x: "https://x.com/yourstore",
		facebook: "https://facebook.com/yourstore",
	},

	contact: {
		email: "support@yourstore.com",
		phone: "+1 (555) 111-4567",
		address: "123 Store Street, City, Country",
	},
};

export type StoreConfig = typeof config;
export default config;
