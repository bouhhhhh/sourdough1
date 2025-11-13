import type { ProductOrRecipe } from "@/lib/product-utils";
import { isProduct } from "@/lib/product-utils";
import { getLocale } from "@/i18n/server";
import { JsonLd, mappedProductsToJsonLd } from "@/ui/json-ld";
import { ProductCard } from "./product-card";

export const ProductList = async ({ products }: { products: ProductOrRecipe[] }) => {
	const locale = await getLocale();

	return (
		<>
			<ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{products.map((product, idx) => (
					<ProductCard 
						key={product.id} 
						product={product} 
						priority={idx < 3}
						locale={locale}
					/>
				))}
			</ul>
			{/* Only include actual products in JSON-LD (filter out recipes) */}
			<JsonLd jsonLd={mappedProductsToJsonLd(products.filter(isProduct))} />
		</>
	);
};
