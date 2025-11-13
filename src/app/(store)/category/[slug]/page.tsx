import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { publicUrl } from "@/env.mjs";
import { getTranslations, getLocale } from "@/i18n/server";
import { listAllItems } from "@/lib/commerce";
import { deslugify } from "@/lib/utils";
import { ProductList } from "@/ui/products/product-list";

export const generateMetadata = async (props: { params: Promise<{ slug: string }> }): Promise<Metadata> => {
	const params = await props.params;
	const locale = await getLocale();
	
	// Use listAllItems to get both products and recipes for the category
	const items = await listAllItems({
		category: params.slug,
		locale,
	});

	if (!items || items.length === 0) {
		return notFound();
	}

	const t = await getTranslations("/category.metadata");

	return {
		title: t("title", { categoryName: deslugify(params.slug) }),
		alternates: { canonical: `${publicUrl}/category/${params.slug}` },
	};
};

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
	const params = await props.params;
	const locale = await getLocale();
	
	// Use listAllItems to get both products and recipes for the category
	const items = await listAllItems({
		category: params.slug,
		locale,
	});

	if (!items || items.length === 0) {
		return notFound();
	}

	const t = await getTranslations("/category.page");

	return (
		<main className="pb-8">
			<h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">
				{deslugify(params.slug)}
				<div className="text-lg font-semibold text-muted-foreground">
					{t("title", { categoryName: deslugify(params.slug) })}
				</div>
			</h1>
			<ProductList products={items} />
		</main>
	);
}
