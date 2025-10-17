import RecipesImage from "@/images/accessories.jpg"; // Using existing image for recipes
import InstructionsImage from "@/images/apparel.jpg"; // Using existing image for instructions

export const config = {
	categories: [
		{ name: "Instructions", slug: "instructions", image: InstructionsImage },
		{ name: "Recipes", slug: "recipes", image: RecipesImage },
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
