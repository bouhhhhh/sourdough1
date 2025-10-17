"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/commerce";
import { ProductCard } from "./product-card";
import { JsonLd, mappedProductsToJsonLd } from "@/ui/json-ld";
import { YnsLink } from "@/ui/yns-link";

interface ResponsiveProductSectionProps {
	allProducts: Product[];
	locale: string;
}

export function ResponsiveProductSection({ allProducts, locale }: ResponsiveProductSectionProps) {
	const [displayCount, setDisplayCount] = useState(1); // Start with mobile-first approach

	useEffect(() => {
		const updateDisplayCount = () => {
			// Check if screen is mobile (less than 640px - sm breakpoint in Tailwind)
			if (typeof window !== 'undefined') {
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
		window.addEventListener('resize', updateDisplayCount);
		
		return () => window.removeEventListener('resize', updateDisplayCount);
	}, []);

	const productsToShow = allProducts.slice(0, displayCount);

	return (
		<section className="w-full py-8">
			<ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{productsToShow.map((product, idx) => (
					<ProductCard 
						key={product.id} 
						product={product} 
						priority={idx < 3}
						locale={locale}
					/>
				))}
			</ul>
			<JsonLd jsonLd={mappedProductsToJsonLd(productsToShow)} />
			
			<div className="flex justify-center mt-8">
				<YnsLink
					className="inline-flex h-12 items-center justify-center rounded-lg bg-gray-500 px-8 font-medium text-white transition-colors hover:bg-gray-600 focus:outline-hidden focus:ring-2 focus:ring-gray-500"
					href="/products"
				>
					Shop More
				</YnsLink>
			</div>
		</section>
	);
}