"use client";

import type { ProductOrRecipe } from "@/lib/product-utils";
import { isProduct } from "@/lib/product-utils";
import Image from "next/image";
import Link from "next/link";
import { formatMoney, getStripeAmountFromDecimal } from "@/lib/utils";
import { AddToCart } from "@/components/add-to-cart";
import { useState } from "react";

interface ProductCardProps {
	product: ProductOrRecipe;
	priority?: boolean;
	locale: string;
}

export function ProductCard({ product, priority = false, locale }: ProductCardProps) {
	const [isHovered, setIsHovered] = useState(false);
	const isProductItem = isProduct(product);
	const itemType = isProductItem ? 'product' : 'recipe';
	const linkHref = `/${itemType}/${product.slug}`;

	return (
		<li 
			className="group"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<article className="overflow-hidden bg-white">
				{product.images[0] && (
					<div className="relative rounded-lg aspect-square w-full overflow-hidden bg-neutral-100">
						<Link href={linkHref}>
							<Image
								className="group-hover:rotate hover-perspective w-full h-full bg-neutral-100 object-cover object-center transition-opacity group-hover:opacity-75"
								src={product.images[0]}
								loading={priority ? "eager" : "lazy"}
								priority={priority}
								sizes="(max-width: 1024x) 100vw, (max-width: 1280px) 50vw, 700px"
								alt=""
								fill
							/>
						</Link>
						
						{/* Bottom Positioned Add to Cart Button - Only for products */}
						{isProductItem && (
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
						)}
					</div>
				)}
				<Link href={linkHref}>
					<div className="p-2">
						<h2 className="text-xl font-medium text-neutral-700">{product.name}</h2>
						<footer className="text-base font-normal text-neutral-900">
							{isProductItem && product.price && (
								<div className="flex items-center gap-2">
									{product.discountedPrice ? (
										<>
											{/* Discounted Price */}
											<p className="text-lg font-semibold text-red-600">
												{product.currency?.length === 3 ? (
													formatMoney({
														amount: getStripeAmountFromDecimal({
															amount: product.discountedPrice,
															currency: product.currency,
														}),
														currency: product.currency,
														locale,
													})
												) : (
													`${product.discountedPrice} ${product.currency || ""}`
												)}
											</p>
											{/* Original Price (crossed out) */}
											<p className="text-sm text-gray-500 line-through">
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
											{/* Discount Badge */}
											<span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
												{Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
											</span>
										</>
									) : (
										/* Regular Price */
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
								</div>
							)}
						</footer>
					</div>
				</Link>
			</article>
		</li>
	);
}