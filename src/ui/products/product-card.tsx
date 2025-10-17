"use client";

import type { Product } from "commerce-kit";
import Image from "next/image";
import { formatMoney, getStripeAmountFromDecimal } from "@/lib/utils";
import { YnsLink } from "@/ui/yns-link";
import { AddToCart } from "@/components/add-to-cart";
import { useState } from "react";

interface ProductCardProps {
	product: Product;
	priority?: boolean;
	locale: string;
}

export function ProductCard({ product, priority = false, locale }: ProductCardProps) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<li 
			className="group"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<article className="overflow-hidden bg-white">
				{product.images[0] && (
					<div className="relative rounded-lg aspect-square w-full overflow-hidden bg-neutral-100">
						<YnsLink href={`/product/${product.slug}`}>
							<Image
								className="group-hover:rotate hover-perspective w-full bg-neutral-100 object-cover object-center transition-opacity group-hover:opacity-75"
								src={product.images[0]}
								width={768}
								height={768}
								loading={priority ? "eager" : "lazy"}
								priority={priority}
								sizes="(max-width: 1024x) 100vw, (max-width: 1280px) 50vw, 700px"
								alt=""
							/>
						</YnsLink>
						
						{/* Bottom Positioned Add to Cart Button */}
						<div 
							className={`absolute bottom-3 left-3 right-3 transition-opacity duration-300 z-10 ${
								isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
							}`}
						>
							<AddToCart
								variantId={product.id}
								quantity={1}
								className="w-full bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-medium shadow-lg transition-colors duration-200"
								openCartOnAdd={false}
								onSuccess={() => {
									// Keep user on current page, cart will update silently
								}}
							>
								Add to Basket
							</AddToCart>
						</div>
					</div>
				)}
				<YnsLink href={`/product/${product.slug}`}>
					<div className="p-2">
						<h2 className="text-xl font-medium text-neutral-700">{product.name}</h2>
						<footer className="text-base font-normal text-neutral-900">
							{product.price && (
								<p>
									{product.currency?.length === 3 ? (
										formatMoney({
											amount: getStripeAmountFromDecimal({
												amount: product.price,
												currency: product.currency,
											}),
											currency: product.currency,
											locale,
										})
									) : (
										`${product.price} ${product.currency || ""}`
									)}
								</p>
							)}
						</footer>
					</div>
				</YnsLink>
			</article>
		</li>
	);
}