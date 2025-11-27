"use client";

import type { ProductOrRecipe } from "@/lib/product-utils";
import { isProduct } from "@/lib/product-utils";
import Image from "next/image";
import Link from "next/link";
import { formatMoney, getStripeAmountFromDecimal } from "@/lib/utils";
import { AddToCart } from "@/components/add-to-cart";
import ProductApplePay from "@/components/product-apple-pay.client";

interface ProductCardProps {
	product: ProductOrRecipe;
	priority?: boolean;
	locale: string;
	showApplePay?: boolean; // New prop to control Apple Pay visibility
}

export function ProductCard({ product, priority = false, locale, showApplePay = false }: ProductCardProps) {
	const isProductItem = isProduct(product);
	const itemType = isProductItem ? 'product' : 'recipe';
	const linkHref = `/${itemType}/${product.slug}`;

	return (
		<li className="group">
			<article className="overflow-hidden bg-white">
				{product.images[0] && (
					<div className="relative rounded-lg aspect-square w-full overflow-hidden bg-neutral-100">
					{/* Banners: Bestseller / Sale */}
					{(product as any).bestSeller && (
						<div className="absolute top-3 left-3 z-20 inline-flex items-center gap-2 rounded-full bg-yellow-500 px-2 py-1 text-xs font-semibold text-white">
							<span>Bestseller</span>
						</div>
					)}
					{(product as any).onSale && (
						<div className="absolute top-3 right-3 z-20 inline-flex items-center gap-2 rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">
							<span>Sale</span>
						</div>
					)}
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
						
						{/* Apple Pay Button - Only on home page, Add to Cart on products page */}
						{isProductItem && showApplePay && (
							<div className="absolute bottom-3 left-3 right-3 z-10">
								<ProductApplePay
									amount={getStripeAmountFromDecimal({
										amount: (product as any).discountedPrice ?? (product as any).price,
										currency: (product as any).currency || "CAD",
									})}
									currency={(((product as any).currency && (product as any).currency.length === 3) ? (product as any).currency : "CAD").toLowerCase()}
									productId={(product as any).id}
									productName={(product as any).name}
									quantity={1}
									fallback={
										<AddToCart
											variantId={(product as any).id}
											quantity={1}
											className="w-full bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-medium shadow-lg transition-colors duration-200"
											openCartOnAdd={false}
										>
											Add to Basket
										</AddToCart>
									}
								/>
							</div>
						)}
						
						{/* Add to Cart Button - Show on products page when not showing Apple Pay */}
						{isProductItem && !showApplePay && (
							<div className="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
								<AddToCart
									variantId={(product as any).id}
									quantity={1}
									className="w-full bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 text-sm font-medium shadow-lg transition-colors duration-200"
									openCartOnAdd={false}
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