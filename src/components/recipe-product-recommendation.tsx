import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RecipeProductRecommendationProps {
  productId: string;
  productName: string;
  productPrice: string;
  productImage: string;
  productSlug: string;
  productDescription: string;
  sectionTitle?: string;
}

export function RecipeProductRecommendation({
  productId,
  productName,
  productPrice,
  productImage,
  productSlug,
  productDescription,
  sectionTitle = "To help you with this recipe",
}: RecipeProductRecommendationProps) {
  return (
    <section className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200 my-12">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">{sectionTitle}</h2>
      
      <div className="grid gap-6 md:grid-cols-[200px_1fr] items-start">
        {/* Product Image */}
        <Link href={`/product/${productSlug}`} className="group">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white shadow-md group-hover:shadow-lg transition-shadow">
            <Image
              src={productImage}
              alt={productName}
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex flex-col justify-between h-full">
          <div className="space-y-3">
            <Link 
              href={`/product/${productSlug}`}
              className="hover:text-neutral-600 transition-colors"
            >
              <h3 className="text-xl font-semibold text-neutral-900">
                {productName}
              </h3>
            </Link>
            
            <p className="text-2xl font-bold text-neutral-900">
              {productPrice}
            </p>
            
            <p className="text-neutral-600 leading-relaxed">
              {productDescription}
            </p>
          </div>

          <div className="mt-6">
            <Link href={`/product/${productSlug}`}>
              <Button 
                className="w-full sm:w-auto px-8 py-6 text-base font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-full"
              >
                SHOP NOW
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
