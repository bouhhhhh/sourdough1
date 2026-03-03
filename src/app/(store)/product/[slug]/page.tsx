// src/app/(store)/product/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";

import { ProductImageModal } from "@/app/(store)/product/[slug]/product-image-modal";
import { AddToCartWithQuantity } from "@/components/add-to-cart-with-quantity";
import { CustomerBreadGallery } from "@/components/customer-bread-gallery";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductApplePayWithDivider } from "@/components/product-apple-pay-with-divider.client";
import { StickyProductBar } from "@/components/sticky-product-bar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { publicUrl } from "@/env.mjs";
import { getLocale, getTranslations } from "@/i18n/server";
import { commerce } from "@/lib/commerce";
import { deslugify, formatMoney } from "@/lib/utils";
import { JsonLd, mappedProductToJsonLd } from "@/ui/json-ld";
import { Markdown } from "@/ui/markdown";
import { MainProductImage } from "@/ui/products/main-product-image";

export const generateMetadata = async (props: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ variant?: string }>;
}): Promise<Metadata> => {
	const params = await props.params;

	const p = await commerce.product.get({ slug: params.slug });
	if (!p) return notFound();

	const t = await getTranslations("/product.metadata");
	const canonical = new URL(`${publicUrl}/product/${params.slug}`);

	return {
		title: t("title", { productName: p.name ?? "" }),
		description: p.description ?? "",
		alternates: { canonical },
	} satisfies Metadata;
};

export default async function SingleProductPage(props: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ variant?: string; image?: string }>;
}) {
	const params = await props.params;
	const t = await getTranslations("/product.page");
	const locale = await getLocale();

	const product = await commerce.product.get({ slug: params.slug, locale });
	if (!product) return notFound();

	const category = product.category ?? null;
	const images =
		Array.isArray(product.images) && product.images.length > 0
			? product.images
			: product.image
				? [product.image]
				: [];

	return (
		<article className="pb-12">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild className="inline-flex min-h-12 min-w-12 items-center justify-center">
							<Link href="/products">{t("allProducts")}</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>

					{category && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink asChild className="inline-flex min-h-12 min-w-12 items-center justify-center">
									<Link href={`/category/${category}`}>{deslugify(category)}</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
						</>
					)}

					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{product.name}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<div className="mt-4 grid gap-4 lg:grid-cols-12">
				{/* Title / Price / Availability */}
				<div className="lg:col-span-5 lg:col-start-8">
					{/* Best Seller Badge */}
					{product.bestSeller && (
						<div className="inline-flex items-center gap-2 mb-2">
							<svg className="w-4 h-4 fill-red-600" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
								<circle cx="8" cy="8" r="8" />
							</svg>
							<span className="text-sm font-semibold text-red-600 uppercase tracking-wide">Best Seller</span>
						</div>
					)}

					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">
								{product.slug === 'sourdough-starter' ? 'Dried Organic Sourdough Starter' : product.name}
							</h1>
							
							{/* Star Rating */}
							<div className="flex items-center gap-2 mt-2">
								<div className="flex items-center" aria-label="5 out of 5 stars">
									{[...Array(5)].map((_, i) => (
										<svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
										</svg>
									))}
								</div>
								<span className="text-sm font-medium text-neutral-600">(15 reviews)</span>
							</div>
						</div>

						{/* Favorite Button */}
						<FavoriteButton productId={product.id} />
					</div>

					{/* Price Section with Discount Support */}
					<div className="mt-2 flex items-center gap-3">
						{product.discountedPrice ? (
							<>
								{/* Discounted Price */}
								<p className="text-2xl font-bold leading-none tracking-tight text-red-600">
									{formatMoney({
										amount: Math.round(product.discountedPrice * 100),
										currency: (product.currency || "CAD").toUpperCase(),
										locale,
									})}
								</p>
								{/* Original Price (crossed out) */}
								<p className="text-lg font-medium leading-none tracking-tight text-foreground/50 line-through">
									{formatMoney({
										amount: Math.round(product.price * 100),
										currency: (product.currency || "CAD").toUpperCase(),
										locale,
									})}
								</p>
								{/* Discount Percentage */}
								<span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
									{Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF
								</span>
							</>
						) : (
							/* Regular Price */
							<p className="text-2xl font-medium leading-none tracking-tight text-foreground/70">
								{formatMoney({
									amount: Math.round(product.price * 100),
									currency: (product.currency || "CAD").toUpperCase(),
									locale,
								})}
							</p>
						)}
					</div>

					<div className="mt-2">{!product.inStock && <div>Out of stock</div>}</div>
				</div>

				{/* Images */}
				<div className="lg:col-span-7 lg:row-span-3 lg:row-start-1">
					<h2 className="sr-only">{t("imagesTitle")}</h2>

					<div className="grid gap-4 lg:grid-cols-3 [&>*:first-child]:col-span-3">
						{images.map((image: string, idx: number) => {
							const qs = new URLSearchParams({ image: idx.toString() }).toString();
							return (
								<Link key={image + idx} href={`?${qs}`} scroll={false}>
									{idx === 0 ? (
										<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
											{/* Banners on image: Bestseller / Sale */}
											{(product as any).bestSeller && (
												<div className="absolute top-3 left-3 z-20 inline-flex items-center gap-2 rounded-full bg-yellow-500 px-3 py-1 text-sm font-semibold text-white">
													Bestseller
												</div>
											)}
											{(product as any).onSale && (
												<div className="absolute top-3 right-3 z-20 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
													Sale
												</div>
											)}
											<MainProductImage
												className="w-full h-full rounded-lg bg-neutral-100 object-cover object-center transition-opacity"
												src={image}
												loading="eager"
												priority
												alt={product.name}
												fill
											/>
										</div>
									) : (
										<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
											{/* Badges for thumbnails too */}
											{(product as any).bestSeller && (
												<div className="absolute top-2 left-2 z-20 inline-flex items-center gap-2 rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-semibold text-white">
													Bestseller
												</div>
											)}
											{(product as any).onSale && (
												<div className="absolute top-2 right-2 z-20 inline-flex items-center gap-2 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
													Sale
												</div>
											)}
											<Image
												className="w-full h-full rounded-lg bg-neutral-100 object-cover object-center transition-opacity"
												src={image}
												sizes="(max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 225px"
												loading="eager"
												priority
												alt={`${product.name} ${idx + 1}`}
												fill
											/>
										</div>
									)}
								</Link>
							);
						})}
					</div>
				</div>

				{/* Action Buttons + Product Details */}
				<div className="grid gap-6 lg:col-span-5">
					{/* Product Features with Checkmarks */}
					<div className="space-y-2 py-4 border-y border-neutral-200">
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							<span className="text-sm text-neutral-700">Free shipping across Canada</span>
						</div>
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							<span className="text-sm text-neutral-700">Manufacturer direct</span>
						</div>
						<div className="flex items-center gap-2">
							<svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
							</svg>
							<span className="text-sm text-neutral-700">Multiple payment methods</span>
						</div>
						{product.ingredients && (
							<>
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
									</svg>
									<span className="text-sm text-neutral-700">Certified Organic</span>
								</div>
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
									</svg>
									<span className="text-sm text-neutral-700">Non-GMO</span>
								</div>
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
									</svg>
									<span className="text-sm text-neutral-700">Made in Canada</span>
								</div>
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
									</svg>
									<span className="text-sm text-neutral-700">Kosher Certified</span>
								</div>
							</>
						)}
					</div>

					{/* Apple Pay Button with conditional "or" divider */}
					{product.inStock && (
						<ProductApplePayWithDivider
							amount={Math.round(((product.discountedPrice ?? product.price) || 0) * 100)}
							currency={(product.currency || "CAD").toLowerCase()}
							productId={product.id}
							productName={product.name}
							quantity={1}
						/>
					)}

					{/* Add to Cart with Quantity */}
					<AddToCartWithQuantity variantId={product.id} disabled={!product.inStock} />
				</div>
			</div>

			{/* Product Information Section - Below the main grid */}
			<div className="mt-12 grid gap-8 lg:grid-cols-12">
				{/* Left Column - Main Description and Sections */}
				<div className="lg:col-span-8 space-y-8">
					<section className="bg-neutral-50 rounded-lg p-6">
						<h2 className="text-2xl font-bold text-neutral-900 mb-4">Product Information</h2>

						{/* Main Description */}
						{product.description && (
							<div className="mb-6">
								<div className="prose prose-sm text-neutral-700 max-w-none">
									<Markdown source={product.description} />
								</div>
							</div>
						)}

						{/* Additional Sections */}
						{product.sections && product.sections.length > 0 && (
							<div className="space-y-6 mt-6">
								{product.sections.map((section, idx) => (
									<div key={idx} className="border-t border-neutral-200 pt-6 first:border-t-0 first:pt-0">
										<h3 className="text-lg font-semibold text-neutral-900 mb-3">{section.title}</h3>
										<div className="prose prose-sm text-neutral-700 max-w-none">
											<Markdown source={section.content} />
										</div>
									</div>
								))}
							</div>
						)}
					</section>

					{/* Ingredients Section */}
					{product.ingredients && (
						<section className="bg-neutral-50 rounded-lg p-6">
							<h2 className="text-xl font-semibold text-neutral-900 mb-4">
								Ingredients, Nutrition, And Allergens
							</h2>
							<div className="space-y-4">
								<div>
									<h3 className="text-sm font-semibold text-neutral-900 mb-2">Ingredients</h3>
									<p className="text-sm text-neutral-700 leading-relaxed">{product.ingredients}</p>
								</div>
							</div>
						</section>
					)}

					{/* Premium Flour Quality Section - Only for sourdough starter */}
					{product.slug === 'sourdough-starter' && (
						<section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
							<h2 className="text-xl font-semibold text-neutral-900 mb-4">Premium Flour Quality</h2>
							<div className="grid gap-4 sm:grid-cols-3">
								{/* Canadian Grain */}
								<div className="flex flex-col items-center text-center p-3 bg-white rounded-lg">
									<img src="/icons/wheat.png" alt="Wheat" className="w-8 h-8 mb-2" style={{ filter: 'brightness(0) saturate(100%) invert(52%) sepia(98%) saturate(1280%) hue-rotate(1deg) brightness(97%) contrast(103%)' }} />
									<div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Canadian Grain</div>
									<div className="text-base font-bold text-neutral-900">100% Canadian</div>
									<div className="text-xs text-neutral-600">Locally Sourced</div>
								</div>

								{/* Milled in Quebec */}
								<div className="flex flex-col items-center text-center p-3 bg-white rounded-lg">
									<svg className="w-8 h-8 text-amber-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									<div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Milled In</div>
									<div className="text-base font-bold text-neutral-900">Quebec, Canada</div>
									<div className="text-xs text-neutral-600">La Milanaise Bio</div>
								</div>

								{/* Organic & Non-GMO */}
								<div className="flex flex-col items-center text-center p-3 bg-white rounded-lg">
									<svg className="w-8 h-8 text-amber-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
									</svg>
									<div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Certified</div>
									<div className="text-base font-bold text-neutral-900">Organic & Non-GMO</div>
									<div className="text-xs text-neutral-600">Premium Quality</div>
								</div>
							</div>
						</section>
					)}
				</div>

				{/* Right Column - Details Sidebar */}
				<div className="lg:col-span-4">
					<div className="bg-neutral-50 rounded-lg p-6 sticky top-4">
						<h2 className="text-xl font-semibold text-neutral-900 mb-4">Details:</h2>
						<ul className="space-y-3">
							{/* Show custom details */}
							{product.details &&
								product.details.map((detail, idx) => (
									<li key={idx} className="flex items-start">
										<span className="text-red-600 mr-2">—</span>
										<span className="text-sm text-neutral-700">
											<strong>{detail.label}:</strong> {detail.value}
										</span>
									</li>
								))}
						</ul>
					</div>
				</div>
			</div>

			{/* Customer Bread Gallery - Show for sourdough products */}
			{params.slug.includes("sourdough") && (
				<div className="mt-12">
					<CustomerBreadGallery />
				</div>
			)}

			<Suspense>
				<SimilarProducts id={product.id} />
			</Suspense>

			<Suspense>
				<ProductImageModal images={images} />
			</Suspense>

			<JsonLd jsonLd={mappedProductToJsonLd(product)} />

			<StickyProductBar
				productId={product.id}
				productName={product.name}
				price={product.price}
				discountedPrice={product.discountedPrice}
				currency={product.currency || "CAD"}
				locale={locale}
				inStock={product.inStock}
			/>
		</article>
	);
}

async function SimilarProducts({ id }: { id: string }) {
	// TODO: Implement similar products functionality with your mock data if needed
	return null;
}
