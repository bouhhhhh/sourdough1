import Image from "next/image";
import type { Metadata } from "next/types";
import { publicUrl } from "@/env.mjs";
import { getTranslations, getLocale } from "@/i18n/server";
import { commerce } from "@/lib/commerce";
import StoreConfig from "@/store.config";
import { CategoryBox } from "@/ui/category-box";
import { ResponsiveProductSection } from "@/ui/products/responsive-product-section";
import { YnsLink } from "@/ui/yns-link";

export const metadata: Metadata = {
	alternates: { canonical: publicUrl },
};

export default async function Home() {
	try {
		const locale = await getLocale();
		// Load only products from "products" category for the homepage
		const result = await commerce.product.browse({ first: 6, category: "products", locale });
		const t = await getTranslations("/");

		const products = result.data || [];

		return (
			<main>
				<section className="relative rounded overflow-hidden py-16 sm:py-24 min-h-[600px] flex items-center">
					{/* Background Image */}
					<Image
						alt="St-Henri Sourdough Background"
						loading="eager"
						priority={true}
						className="absolute inset-0 w-full h-full object-cover"
						fill
						src="/st-henri.webp"
						sizes="100vw"
					/>
					{/* Overlay */}
					<div className="absolute inset-0 bg-black/40"></div>
					
					{/* Content */}
					<div className="relative z-10 mx-auto max-w-4xl px-8 sm:px-16">
						<div className="max-w-md space-y-6">
							<h2 className="text-balance text-4xl font-bold tracking-tight md:text-5xl text-white">
								{t("hero.title")}
							</h2>
							<p className="text-pretty text-white/90 text-lg">{t("hero.description")}</p>
							<YnsLink
								className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 font-medium text-neutral-900 transition-colors hover:bg-white/90 focus:outline-hidden focus:ring-2 focus:ring-white"
								href={t("hero.link")}
							>
								{t("hero.action")}
							</YnsLink>
						</div>
					</div>
				</section>

				<ResponsiveProductSection allProducts={products} locale={locale} />

				<section className="w-full py-8">
					<div className="grid gap-8 lg:grid-cols-2">
						{StoreConfig.categories.map(({ slug, image: src }) => (
							<CategoryBox key={slug} categorySlug={slug} src={src} />
						))}
					</div>
				</section>
			</main>
		);
	} catch (error) {
		console.error("Error in Home component:", error);
		const t = await getTranslations("/");
		const locale = await getLocale();

		// Fallback to empty products if commerce fails
		const products: never[] = [];

		return (
			<main>
				<section className="rounded bg-neutral-100 py-8 sm:py-12">
					<div className="mx-auto grid grid-cols-1 items-center justify-items-center gap-8 px-8 sm:px-16 md:grid-cols-2">
						<div className="max-w-md space-y-4">
							<h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
								{t("hero.title")}
							</h2>
							<p className="text-pretty text-neutral-600">{t("hero.description")}</p>
							<YnsLink
								className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-900 px-6 font-medium text-neutral-50 transition-colors hover:bg-neutral-900/90 focus:outline-hidden focus:ring-1 focus:ring-neutral-950"
								href={t("hero.link")}
							>
								{t("hero.action")}
							</YnsLink>
						</div>
						<Image
							alt="Cup of Coffee"
							loading="eager"
							priority={true}
							className="rounded"
							height={450}
							width={450}
							src="https://files.stripe.com/links/MDB8YWNjdF8xT3BaeG5GSmNWbVh6bURsfGZsX3Rlc3RfaDVvWXowdU9ZbWlobUIyaHpNc1hCeDM200CBzvUjqP"
							style={{
								objectFit: "cover",
							}}
							sizes="(max-width: 640px) 70vw, 450px"
						/>
					</div>
				</section>

				<ResponsiveProductSection allProducts={products} locale={locale} />

				<section className="w-full py-8">
					<div className="grid gap-8 lg:grid-cols-2">
						{StoreConfig.categories.map(({ slug, image: src }) => (
							<CategoryBox key={slug} categorySlug={slug} src={src} />
						))}
					</div>
				</section>
				<div className="text-center text-red-500 p-4">
					Error loading products: {error instanceof Error ? error.message : "Unknown error"}
					<br />
					<small>Check server logs for more details</small>
				</div>
			</main>
		);
	}
}
