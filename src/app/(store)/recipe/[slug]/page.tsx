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
import { FavoriteButton } from "@/components/favorite-button";
import { RecipeProductRecommendation } from "@/components/recipe-product-recommendation";

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

  // Type-safe access to recipe extensions
  const prepTime = (recipe as any).prepTime;
  const cookTime = (recipe as any).cookTime;
  const servings = (recipe as any).servings;
  const pricePerServing = (recipe as any).pricePerServing;
  const tags = (recipe as any).tags || [];
  const ingredients = (recipe as any).ingredients || [];
  const preparation = (recipe as any).preparation || [];
  const notes = (recipe as any).notes || [];
  const recommendedProduct = (recipe as any).recommendedProduct;

  return (
    <article className="pb-12">
      <Breadcrumb className="mb-6">
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

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column - Image */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {displayedImage && (
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-lg">
              <Image
                className="object-cover object-center"
                src={displayedImage}
                alt={recipe.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute top-4 left-4">
                <FavoriteButton productId={recipe.id} className="p-3 bg-white rounded-full shadow-lg hover:bg-neutral-50 transition-colors" />
              </div>
            </div>
          )}

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {images.map((image, idx) => (
                <Link
                  scroll={false}
                  key={image}
                  href={`?image=${idx}`}
                  className={`relative aspect-square overflow-hidden rounded-lg bg-neutral-100 transition-all ${
                    idx === displayedImageIndex ? "ring-2 ring-neutral-900" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image className="object-cover object-center" src={image} alt="" fill sizes="120px" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Recipe Details */}
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-4">
              {recipe.name}
            </h1>

            {/* Rating placeholder - can be made dynamic later */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-neutral-600">(10)</span>
              <Link href="#" className="text-sm text-neutral-600 hover:text-neutral-900 underline">
                Rate this recipe
              </Link>
            </div>

            {/* Description */}
            {recipe.description && (
              <p className="text-neutral-700 leading-relaxed text-lg">
                {recipe.description}
              </p>
            )}
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {prepTime && (
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <div className="text-sm text-neutral-600 mb-1">Preparation</div>
                <div className="text-lg font-semibold text-neutral-900">{prepTime}</div>
              </div>
            )}
            {cookTime && (
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <div className="text-sm text-neutral-600 mb-1">Cooking</div>
                <div className="text-lg font-semibold text-neutral-900">{cookTime}</div>
              </div>
            )}
            {servings && (
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <div className="text-sm text-neutral-600 mb-1">Servings</div>
                <div className="text-lg font-semibold text-neutral-900">{servings}</div>
              </div>
            )}
            {pricePerServing && (
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <div className="text-sm text-neutral-600 mb-1">Price per serving</div>
                <div className="text-lg font-semibold text-neutral-900">{pricePerServing}</div>
              </div>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Categories Section */}
          {category && (
            <div className="border-t border-neutral-200 pt-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Categories</h2>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/category/${category}`}
                  className="px-4 py-2 rounded-full bg-neutral-200 text-neutral-700 hover:bg-neutral-300 transition-colors text-sm font-medium"
                >
                  {deslugify(category)}
                </Link>
              </div>
            </div>
          )}

          {/* Ingredients Section */}
          {ingredients.length > 0 && (
            <div className="border-t border-neutral-200 pt-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Ingredients</h2>
              <div className="space-y-3">
                {ingredients.map((ingredient: any, idx: number) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500"
                    />
                    <span className="text-neutral-700 group-hover:text-neutral-900">
                      {ingredient.amount && (
                        <span className="font-medium">{ingredient.amount} </span>
                      )}
                      {ingredient.item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Preparation Steps */}
          {preparation.length > 0 && (
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Preparation</h2>
                <button className="px-4 py-2 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors">
                  ACTIVATE COOKING MODE
                </button>
              </div>
              <ol className="space-y-6">
                {preparation.map((step: any) => (
                  <li key={step.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                    <p className="text-neutral-700 leading-relaxed pt-1">
                      {step.instruction}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Notes Section */}
          {notes.length > 0 && (
            <div className="border-t border-neutral-200 pt-6 space-y-6">
              {notes.map((note: any, idx: number) => (
                <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                    {note.title}
                  </h3>
                  <p className="text-neutral-700 leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Recommended Product */}
          {recommendedProduct && (
            <RecipeProductRecommendation
              productId={recommendedProduct.productId}
              productName={recommendedProduct.productName}
              productPrice={recommendedProduct.productPrice}
              productImage={recommendedProduct.productImage}
              productSlug={recommendedProduct.productSlug}
              productDescription={recommendedProduct.productDescription}
            />
          )}
        </div>
      </div>
    </article>
  );
}
