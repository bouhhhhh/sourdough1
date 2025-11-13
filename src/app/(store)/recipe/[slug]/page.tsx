// src/app/(store)/recipe/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";

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
import { deslugify } from "@/lib/utils";
import { Markdown } from "@/ui/markdown";

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const params = await props.params;

  const recipe = await commerce.recipe.get({ slug: params.slug });
  if (!recipe) return notFound();

  const t = await getTranslations("/recipe.metadata");
  const canonical = new URL(`${publicUrl}/recipe/${params.slug}`);

  return {
    title: t("title", { recipeName: recipe.name ?? "" }),
    description: recipe.description ?? "",
    alternates: { canonical },
  } satisfies Metadata;
};

export default async function SingleRecipePage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ image?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const t = await getTranslations("/recipe.page");
  const locale = await getLocale();

  const recipe = await commerce.recipe.get({ slug: params.slug, locale });
  if (!recipe) return notFound();

  const category = recipe.category ?? null;
  const images =
    Array.isArray(recipe.images) && recipe.images.length > 0
      ? recipe.images
      : recipe.image
        ? [recipe.image]
        : [];

  const displayedImageIndex = searchParams.image ? Number.parseInt(searchParams.image, 10) : 0;
  const displayedImage = images[displayedImageIndex] ?? images[0];

  return (
    <article className="pb-12">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild className="inline-flex min-h-12 min-w-12 items-center justify-center">
              <Link href="/recipes">{t("allRecipes")}</Link>
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
            <BreadcrumbPage className="inline-flex min-h-12 min-w-12 items-center justify-center">
              {recipe.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 grid gap-6 lg:grid-cols-6">
        <div className="grid gap-2 lg:col-span-3">
          {displayedImage && (
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
              <Image
                className="object-cover object-center"
                src={displayedImage}
                alt={recipe.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          )}

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, idx) => (
                <Link
                  scroll={false}
                  key={image}
                  href={`?image=${idx}`}
                  className={`relative aspect-square overflow-hidden rounded-lg bg-neutral-100 ${
                    idx === displayedImageIndex ? "ring-2 ring-black" : ""
                  }`}
                >
                  <Image className="object-cover object-center" src={image} alt="" fill sizes="120px" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <section className="flex flex-col lg:col-span-3">
          <div className="mb-8">
            <h1 className="mb-4 text-3xl font-bold leading-none md:text-4xl">{recipe.name}</h1>

            {recipe.description && (
              <div className="prose prose-sm mt-4">
                <Markdown source={recipe.description} />
              </div>
            )}
          </div>

          <div className="mt-auto">
            <div className="rounded-lg bg-neutral-50 p-6">
              <h2 className="text-xl font-semibold mb-4">{t("aboutThisRecipe")}</h2>
              <p className="text-neutral-600">
                {t("recipeNote")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
