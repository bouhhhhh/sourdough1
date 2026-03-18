import { getLocale } from "@/i18n/server";
import type { ProductOrRecipe } from "@/lib/product-utils";
import { isProduct } from "@/lib/product-utils";
import { JsonLd, mappedProductsToJsonLd } from "@/ui/json-ld";
import { ProductCard } from "./product-card";

export const ProductList = async ({ products }: { products: ProductOrRecipe[] }) => {
	const locale = await getLocale();

	return (
		<>
			<ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
				{products.map((product, idx) => (
					<ProductCard
						key={product.id}
						product={product}
						priority={idx < 3}
						locale={locale}
						showApplePay={false}
					/>
				))}
			</ul>
			{/* Only include actual products in JSON-LD (filter out recipes) */}
			<JsonLd jsonLd={mappedProductsToJsonLd(products.filter(isProduct))} />
		</>
	);
};
