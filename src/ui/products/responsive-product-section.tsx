"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/client";
import type { ProductOrRecipe } from "@/lib/product-utils";
import { isProduct } from "@/lib/product-utils";
import { JsonLd, mappedProductsToJsonLd } from "@/ui/json-ld";
import { ProductCard } from "./product-card";

interface ResponsiveProductSectionProps {
	allProducts: ProductOrRecipe[];
	locale: string;
}

export function ResponsiveProductSection({ allProducts, locale }: ResponsiveProductSectionProps) {
	const [displayCount, setDisplayCount] = useState(1); // Start with mobile-first approach
	const t = useTranslations("Global.actions");

	useEffect(() => {
		const updateDisplayCount = () => {
			// Check if screen is mobile (less than 640px - sm breakpoint in Tailwind)
			if (typeof window !== "undefined") {
				if (window.innerWidth < 640) {
					setDisplayCount(1); // Show 1 product on mobile
				} else {
					setDisplayCount(3); // Show 3 products on desktop/tablet
				}
			}
		};

		// Set initial count
		updateDisplayCount();

		// Listen for window resize
		window.addEventListener("resize", updateDisplayCount);

		return () => window.removeEventListener("resize", updateDisplayCount);
	}, []);

	const productsToShow = allProducts.slice(0, displayCount);

	return (
		<section className="w-full py-6">
			<ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
				{productsToShow.map((product, idx) => (
					<ProductCard
						key={product.id}
						product={product}
						priority={idx < 3}
						locale={locale}
						showApplePay={true}
					/>
				))}
			</ul>
			{/* Only include actual products in JSON-LD (filter out recipes) */}
			<JsonLd jsonLd={mappedProductsToJsonLd(productsToShow.filter(isProduct))} />

			<div className="flex justify-center mt-6">
				<Link
					className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-500 px-6 text-sm font-medium text-white transition-colors hover:bg-gray-600 focus:outline-hidden focus:ring-2 focus:ring-gray-500"
					href="/products"
				>
					{t("shopMore")}
				</Link>
			</div>
		</section>
	);
}
