import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";

export function SourdoughMaintenanceCTA() {
  return (
    <section className="w-full py-16 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Image Side */}
          <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/maintenance.jpg"
              alt="Sourdough Starter Maintenance"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Content Side */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 text-orange-600">
              <Heart className="w-5 h-5 fill-current" />
              <span className="text-sm font-semibold uppercase tracking-wide">Expert Guide</span>
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-neutral-900 lg:text-5xl">
              How to Maintain Your Sourdough Starter
            </h2>

            <p className="text-lg text-neutral-600 leading-relaxed">
              Keep your sourdough starter healthy and active with our comprehensive maintenance guide. 
              Learn the essential feeding schedule, temperature control, and troubleshooting tips to 
              ensure your starter produces the best bread every time.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                  <span className="text-orange-600 text-sm font-bold">✓</span>
                </div>
                <p className="text-neutral-700">Daily feeding and care instructions</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                  <span className="text-orange-600 text-sm font-bold">✓</span>
                </div>
                <p className="text-neutral-700">Signs of a healthy vs. unhealthy starter</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                  <span className="text-orange-600 text-sm font-bold">✓</span>
                </div>
                <p className="text-neutral-700">Storage tips for active and dormant starters</p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/recipe/sourdough-starter-maintenance"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                View Complete Guide
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
