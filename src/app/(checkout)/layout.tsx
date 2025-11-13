import "@/app/globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/cart-context";
import { Footer } from "@/ui/footer/footer";
import { accountToWebsiteJsonLd, JsonLd } from "@/ui/json-ld";
import { CheckoutNav } from "@/ui/nav/checkout-nav";

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <CheckoutNav />
      <TooltipProvider>
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-6 pt-2 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </TooltipProvider>
      <JsonLd
        jsonLd={accountToWebsiteJsonLd({
          account: null,
          logoUrl: null,
        })}
      />
    </CartProvider>
  );
}
