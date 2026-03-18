"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCart } from "@/components/add-to-cart";
import ProductApplePay from "@/components/product-apple-pay.client";
import type { ProductOrRecipe } from "@/lib/product-utils";
import { isProduct } from "@/lib/product-utils";
import { formatMoney, getStripeAmountFromDecimal } from "@/lib/utils";

interface ProductCardProps {
	product: ProductOrRecipe;
	priority?: boolean;
	locale: string;
	showApplePay?: boolean; // New prop to control Apple Pay visibility
}

export function ProductCard({ product, priority = false, locale, showApplePay = false }: ProductCardProps) {
	const isProductItem = isProduct(product);
	const itemType = isProductItem ? "product" : "recipe";
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
									currency={((product as any).currency && (product as any).currency.length === 3
										? (product as any).currency
										: "CAD"
									).toLowerCase()}
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
					<div className="p-1.5">
						<h2 className="text-lg font-medium text-neutral-700">{product.name}</h2>

						{/* Star Rating */}
						<div className="flex items-center gap-1 mt-0.5 mb-1.5">
							<div className="flex items-center" aria-label="5 out of 5 stars">
								{[...Array(5)].map((_, i) => (
									<svg key={i} className="w-3.5 h-3.5 fill-yellow-400" viewBox="0 0 20 20">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								))}
							</div>
							<span className="text-xs text-neutral-600">(15)</span>
						</div>

						<footer className="text-sm font-normal text-neutral-900">
							{isProductItem && product.price && (
								<div className="flex items-center gap-2">
									{product.discountedPrice ? (
										<>
											{/* Discounted Price */}
											<p className="text-base font-semibold text-red-600">
												{product.currency?.length === 3
													? formatMoney({
															amount: getStripeAmountFromDecimal({
																amount: product.discountedPrice,
																currency: product.currency,
															}),
															currency: product.currency,
															locale,
														})
													: `${product.discountedPrice} ${product.currency || ""}`}
											</p>
											{/* Original Price (crossed out) */}
											<p className="text-xs text-gray-500 line-through">
												{product.currency?.length === 3
													? formatMoney({
															amount: getStripeAmountFromDecimal({
																amount: product.price,
																currency: product.currency,
															}),
															currency: product.currency,
															locale,
														})
													: `${product.price} ${product.currency || ""}`}
											</p>
											{/* Discount Badge */}
											<span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
												{Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
											</span>
										</>
									) : (
										/* Regular Price */
										<p>
											{product.currency?.length === 3
												? formatMoney({
														amount: getStripeAmountFromDecimal({
															amount: product.price,
															currency: product.currency,
														}),
														currency: product.currency,
														locale,
													})
												: `${product.price} ${product.currency || ""}`}
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
