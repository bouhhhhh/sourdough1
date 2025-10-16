// src/app/(store)/product/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { Suspense } from "react";

import { ProductImageModal } from "@/app/(store)/product/[slug]/product-image-modal";
import { AddToCart } from "@/components/add-to-cart";
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

  const product = await commerce.product.get({ slug: params.slug });
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
          <h1 className="text-3xl font-bold leading-none tracking-tight text-foreground">
            {product.name}
          </h1>

			<p className="mt-2 text-2xl font-medium leading-none tracking-tight text-foreground/70">
			{formatMoney({
				amount: Math.round(product.price * 100), // <-- convert to cents
				currency: (product.currency || "CAD").toUpperCase(), // e.g., "CAD"
				locale,
			})}
			</p>

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
                    <MainProductImage
                      className="w-full rounded-lg bg-neutral-100 object-cover object-center transition-opacity"
                      src={image}
                      loading="eager"
                      priority
                      alt={product.name}
                    />
                  ) : (
                    <Image
                      className="w-full rounded-lg bg-neutral-100 object-cover object-center transition-opacity"
                      src={image}
                      width={700 / 3}
                      height={700 / 3}
                      sizes="(max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 225px"
                      loading="eager"
                      priority
                      alt={`${product.name} ${idx + 1}`}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Description + Add to Cart */}
        <div className="grid gap-8 lg:col-span-5">
          <section>
            <h2 className="sr-only">{t("descriptionTitle")}</h2>
            <div className="prose text-secondary-foreground">
              <Markdown source={product.description ?? ""} />
            </div>
          </section>

          <AddToCart
            variantId={product.id}
            className={!product.inStock ? "opacity-50 cursor-not-allowed" : ""}
          >
            {!product.inStock ? "Out of Stock" : "Add to Cart"}
          </AddToCart>
        </div>
      </div>

      <Suspense>
        <SimilarProducts id={product.id} />
      </Suspense>

      <Suspense>
        <ProductImageModal images={images} />
      </Suspense>

      <JsonLd jsonLd={mappedProductToJsonLd(product)} />
    </article>
  );
}

async function SimilarProducts({ id }: { id: string }) {
  // TODO: Implement similar products functionality with your mock data if needed
  return null;
}
