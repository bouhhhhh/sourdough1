import type { Product as LocalProduct } from "@/lib/commerce";
import type { ItemList, Product, Thing, WebSite, WithContext } from "schema-dts";
import type Stripe from "stripe";

export const JsonLd = <T extends Thing>({ jsonLd }: { jsonLd: WithContext<T> }) => {
	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
};

export const mappedProductToJsonLd = (product: LocalProduct): WithContext<Product> => {
	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.name,
		image: product.images[0],
		description: product.description ?? undefined,
		sku: product.id,
		offers: {
			"@type": "Offer",
			price: (product.discountedPrice || product.price).toString(),
			priceCurrency: product.currency,
			availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
		},
	};
};

export const mappedProductsToJsonLd = (products: readonly LocalProduct[]): WithContext<ItemList> => {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: products.map(mappedProductToJsonLd),
	};
};

export const accountToWebsiteJsonLd = ({
	account,
	logoUrl,
}: {
	account: Stripe.Account | null | undefined;
	logoUrl: string | null | undefined;
}): WithContext<WebSite> => {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: account?.business_profile?.name ?? "StHenri",
		url: account?.business_profile?.url ?? "https://maisonheirbloom.ca",
		mainEntityOfPage: {
			"@type": "WebPage",
			url: account?.business_profile?.url ?? "https://maisonheirbloom.ca",
		},
		...(logoUrl && {
			image: {
				"@type": "ImageObject",
				url: logoUrl,
			},
		}),
		publisher: {
			"@type": "Organization",
			name: account?.business_profile?.name ?? "HeirBloom",
			url: account?.business_profile?.url ?? "https://maisonheirbloom.ca",
		},
	};
};
