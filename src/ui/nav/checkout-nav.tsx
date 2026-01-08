import Link from "next/link";
import { SeoH1 } from "@/ui/seo-h1";

export const CheckoutNav = () => {
  return (
    <header className="z-50 py-4 sticky top-0 bg-white/90 backdrop-blur-xs nav-border-reveal">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <SeoH1 className="-mt-0.5 whitespace-nowrap text-xl font-bold">StHenri</SeoH1>
        </Link>
      </div>
    </header>
  );
};
